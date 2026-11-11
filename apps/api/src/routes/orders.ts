import type { FastifyInstance } from "fastify";
import { prisma } from "@repo/db";
import { isAdminRole, requireAdmin, requireAuth } from "../middleware/auth";
import { z } from "zod";
import { randomInt } from "node:crypto";
import { notifyUser } from "../lib/push";
import { quoteGeneralStoreSelection } from "../lib/general-store-pricing";
import { getGeneralStoreControls } from "../lib/general-store-settings";

const MAX_INT = 2_147_483_647;

const createOrderSchema = z.object({
  pickupSlotId: z.string(),
  paymentMethod: z.literal("CASH").default("CASH"),
  customerName: z.string().trim().min(1).max(120),
  pickupPersonName: z.string().trim().min(1).max(120),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PARTIALLY_ACCEPTED", "CONFIRMED", "READY_FOR_PICKUP", "CANCELLED"]),
});

const confirmOrderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number().int().min(0).optional().default(0),
    acceptedSelectionType: z.enum(["PACKED", "LOOSE"]).optional(),
    acceptedTotalWeightGrams: z.number().int().min(1).max(1000000).optional(),
    acceptedPackingLabel: z.string().trim().max(80).optional(),
    acceptedPackingWeight: z.string().trim().max(40).optional(),
    acceptedWeightGrams: z.number().int().min(1).max(1000000).optional(),
    fulfillmentNote: z.string().trim().max(200).optional(),
  })).min(1),
});

const fulfillmentSchema = z.object({
  pickupCode: z.string().trim().regex(/^[A-Z0-9]{8}$/, "Pickup code must be 8 uppercase letters and numbers"),
  pickedUp: z.boolean(),
  paymentPaid: z.boolean(),
});

const pickupCodeSchema = z.object({
  pickupCode: z.string().trim().regex(/^[A-Z0-9]{8}$/, "Pickup code must be 8 uppercase letters and numbers"),
});

function generatePickupNumber() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const suffix = Array.from({ length: 6 }, () => alphabet[randomInt(0, alphabet.length)]).join("");
  return `MM${suffix}`;
}

function parseWeightGrams(value: unknown) {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms|g|gm|gram|grams)$/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const grams = match[2].toLowerCase().startsWith("k") ? amount * 1000 : amount;
  return Number.isSafeInteger(grams) && grams > 0 ? grams : null;
}

function packingWeightGrams(packing: unknown) {
  if (typeof packing !== "object" || packing === null) return null;
  const item = packing as { weightGrams?: unknown; weight?: unknown };
  if (typeof item.weightGrams === "number" && Number.isSafeInteger(item.weightGrams) && item.weightGrams > 0) return item.weightGrams;
  return parseWeightGrams(item.weight);
}

function findPacking(product: { packagingSizes: unknown }, label: string | undefined) {
  const packings = Array.isArray(product.packagingSizes) ? product.packagingSizes : [];
  return packings.find((packing) => typeof packing === "object" && packing !== null && (packing as { label?: unknown }).label === label) as { label?: string; weight?: string; weightGrams?: number; availability?: string } | undefined;
}

export async function orderRoutes(app: FastifyInstance) {
  // All order routes require authentication
  app.addHook('preHandler', requireAuth);

  // User: Get my orders
  app.get("/", async (request, reply) => {
    const controls = await getGeneralStoreControls();
    if (!controls.generalStoreOrdersOpen) return reply.status(503).send({ error: controls.generalStoreMaintenanceMessage });
    const userId = (request as any).user.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        pickupSlot: true,
        items: true
      }
    });
    return reply.send(orders);
  });

  // User: Get order by ID
  app.get("/:id", async (request, reply) => {
    const controls = await getGeneralStoreControls();
    if (!controls.generalStoreOrdersOpen) return reply.status(503).send({ error: controls.generalStoreMaintenanceMessage });
    const userId = (request as any).user.id;
    const { id } = request.params as { id: string };
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        pickupSlot: true,
        items: true
      }
    });
    if (!order || (order.userId !== userId && !isAdminRole((request as any).user.role))) {
      return reply.status(404).send({ error: "Order not found" });
    }
    return reply.send(order);
  });

  // User: Checkout / Create Order
  app.post("/", async (request, reply) => {
    try {
      const controls = await getGeneralStoreControls();
      if (!controls.generalStoreEnabled || !controls.generalStoreCheckoutOpen) return reply.status(503).send({ error: controls.generalStoreMaintenanceMessage });
      const userId = (request as any).user.id;
      const { pickupSlotId, paymentMethod, customerName, pickupPersonName } = createOrderSchema.parse(request.body);
      const headerKey = request.headers["idempotency-key"];
      const idempotencyKey = typeof headerKey === "string" && /^[A-Za-z0-9._-]{8,120}$/.test(headerKey) ? headerKey : null;
      if (idempotencyKey) {
        const existing = await prisma.order.findUnique({ where: { idempotencyKey }, include: { items: true, pickupSlot: true } });
        if (existing && existing.userId === userId) return reply.send(existing);
      }

      // 1. Get Cart
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: { product: true }
          }
        }
      });

      if (!cart || cart.items.length === 0) {
        return reply.status(400).send({ error: "Cart is empty" });
      }
      if (cart.items.some((item) => !item.product.isGeneralStore)) {
        return reply.status(400).send({ error: "Only general store products can be checked out" });
      }
      if (cart.items.some((item) => !item.product.isActive)) {
        return reply.status(409).send({ error: "One or more products in your cart are currently unavailable" });
      }
      if (cart.items.some((item) => item.quantity < 1 || item.quantity > 100000)) {
        return reply.status(400).send({ error: "Cart contains an invalid quantity" });
      }

      // 2. Validate Pickup Slot
      const pickupSlot = await prisma.pickupSlot.findUnique({
        where: { id: pickupSlotId }
      });
      if (!pickupSlot || !pickupSlot.isActive) {
        return reply.status(400).send({ error: "Invalid or inactive pickup slot" });
      }

      // 3. Calculate Total and Prepare Items
      let totalInPaise = 0;
      const orderItemsData = cart.items.map(item => {
        const quote = quoteGeneralStoreSelection(item.product, {
          quantity: item.quantity,
          selectionType: item.selectionType,
          packingLabel: item.packingLabel,
          packingWeight: item.packingWeight,
          requestedWeightGrams: item.requestedWeightGrams,
        });
        totalInPaise += quote.totalPriceInPaise;
        return {
          productId: item.productId,
          productName: item.product.name,
          packingLabel: item.packingLabel,
          packingWeight: item.packingWeight,
          acceptedPackingLabel: item.packingLabel,
          acceptedPackingWeight: item.packingWeight,
          selectionType: quote.selectionType,
          requestedWeightGrams: quote.requestedWeightGrams ?? null,
          acceptedWeightGrams: quote.acceptedWeightGrams,
          pricingUnit: quote.pricingUnit,
          unitPriceInPaise: quote.unitPriceInPaise,
          requestedQuantity: quote.quantity,
          quantity: quote.quantity,
          totalPriceInPaise: quote.totalPriceInPaise
        };
      });
      if (!Number.isSafeInteger(totalInPaise) || totalInPaise > MAX_INT) {
        return reply.status(400).send({ error: "Order total exceeds the supported limit" });
      }

      // 4. Create Order & clear cart inside a transaction
      const order = await prisma.$transaction(async (tx) => {
        const activeOrdersForSlot = await tx.order.count({
          where: {
            pickupSlotId,
            status: { not: "CANCELLED" },
          },
        });
        if (activeOrdersForSlot >= pickupSlot.capacity) {
          throw new Error("This pickup slot is full. Please choose another slot");
        }

        const newOrder = await tx.order.create({
          data: {
            pickupNumber: generatePickupNumber(),
            idempotencyKey,
            userId,
            pickupSlotId,
            customerName,
            pickupPersonName,
            paymentMethod,
            totalInPaise,
            items: {
              create: orderItemsData
            }
          },
          include: {
            items: true,
            pickupSlot: true
          }
        });

        // Clear cart
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id }
        });

        return newOrder;
      }, { isolationLevel: "Serializable" });

      void notifyUser(userId, "Order received", `Your pickup order ${order.pickupNumber} has been received.`, "/orders");
      return reply.status(201).send(order);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // Admin Routes
  app.get("/all", { preHandler: requireAdmin }, async (request, reply) => {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        serialNumber: true,
        customerName: true,
        pickupPersonName: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        totalInPaise: true,
        createdAt: true,
        pickupSlot: true,
        items: true,
        user: { select: { email: true } },
      }
    });
    const productIds = orders.flatMap((order) => order.items.map((item) => item.productId).filter((productId): productId is string => Boolean(productId)));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, priceInPaise: true, packagingSizes: true, allowLooseQuantity: true, loosePricingRules: true },
    });
    const productsById = new Map(products.map((product) => [product.id, product]));
    return reply.send(orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({ ...item, product: item.productId ? productsById.get(item.productId) || null : null })),
    })));
  });

  app.patch("/:id/confirm", { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { items } = confirmOrderSchema.parse(request.body);
      const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
      if (!order) return reply.status(404).send({ error: "Order not found" });
      if (!['PENDING', 'PARTIALLY_ACCEPTED'].includes(order.status)) {
        return reply.status(409).send({ error: "Only pending or partially accepted orders can be reviewed" });
      }
      if (["PICKED_UP", "CANCELLED"].includes(order.status)) {
        return reply.status(409).send({ error: "This order can no longer be confirmed" });
      }

      const requestedQuantities = new Map(items.map((item) => [item.id, item.quantity]));
      const updatesById = new Map(items.map((item) => [item.id, item]));
      if (updatesById.size !== items.length || order.items.some((item) => !updatesById.has(item.id))) {
        return reply.status(400).send({ error: "Every order item must be reviewed" });
      }
      const products = await prisma.product.findMany({ where: { id: { in: order.items.map((item) => item.productId).filter((id): id is string => Boolean(id)) } } });
      const productsById = new Map(products.map((product) => [product.id, product]));
      const acceptedQuotes = new Map<string, ReturnType<typeof quoteGeneralStoreSelection>>();
      const acceptedQuantities = new Map<string, number>();
      const requestedWeights = new Map<string, number>();
      for (const item of order.items) {
        const selected = (requestedQuantities.get(item.id) ?? 0) > 0;
        if (!selected) continue;
        const product = item.productId ? productsById.get(item.productId) : undefined;
        if (!product) return reply.status(409).send({ error: `${item.productName} is no longer available for repricing` });
        const update = updatesById.get(item.id);
        const originalPacking = item.selectionType === "PACKED" ? findPacking(product, item.packingLabel) : undefined;
        const originalUnitWeight = item.selectionType === "LOOSE" ? item.requestedWeightGrams : packingWeightGrams(originalPacking);
        if (!originalUnitWeight) return reply.status(409).send({ error: `${item.productName} does not have a usable weight configured` });
        const requestedTotalWeight = originalUnitWeight * item.requestedQuantity;
        requestedWeights.set(item.id, requestedTotalWeight);
        const acceptedSelectionType = update?.acceptedSelectionType || item.selectionType;
        const acceptedTotalWeight = update?.acceptedTotalWeightGrams ?? requestedTotalWeight;
        if (!Number.isSafeInteger(acceptedTotalWeight) || acceptedTotalWeight < 1 || acceptedTotalWeight > requestedTotalWeight) {
          return reply.status(400).send({ error: `${item.productName} cannot exceed the requested ${requestedTotalWeight}g total weight` });
        }
        let acceptedQuantity: number;
        let quoteInput: Parameters<typeof quoteGeneralStoreSelection>[1];
        if (acceptedSelectionType === "LOOSE") {
          if (!product.allowLooseQuantity) return reply.status(400).send({ error: `${item.productName} does not allow loose quantity` });
          if (acceptedTotalWeight % originalUnitWeight !== 0) {
            return reply.status(400).send({ error: `${item.productName} loose total weight must be divisible into whole ${originalUnitWeight}g units` });
          }
          acceptedQuantity = acceptedTotalWeight / originalUnitWeight;
          quoteInput = {
            quantity: acceptedQuantity,
            selectionType: "LOOSE",
            packingLabel: "Loose quantity",
            packingWeight: `${originalUnitWeight}g`,
            requestedWeightGrams: originalUnitWeight,
          };
        } else {
          const acceptedLabel = update?.acceptedPackingLabel || item.packingLabel;
          const acceptedPacking = findPacking(product, acceptedLabel);
          if (!acceptedPacking || acceptedPacking.availability === "UNAVAILABLE") return reply.status(400).send({ error: `${item.productName} has no available packing option selected` });
          const acceptedUnitWeight = packingWeightGrams(acceptedPacking);
          if (!acceptedUnitWeight) return reply.status(400).send({ error: `${item.productName} selected packing has no usable weight` });
          if (acceptedTotalWeight % acceptedUnitWeight !== 0) return reply.status(400).send({ error: `${item.productName} total weight must be divisible into whole ${acceptedUnitWeight}g packs` });
          acceptedQuantity = acceptedTotalWeight / acceptedUnitWeight;
          quoteInput = {
            quantity: acceptedQuantity,
            selectionType: "PACKED",
            packingLabel: acceptedLabel,
            packingWeight: update?.acceptedPackingWeight || acceptedPacking.weight,
          };
        }
        const quote = quoteGeneralStoreSelection(product, quoteInput);
        acceptedQuantities.set(item.id, acceptedQuantity);
        acceptedQuotes.set(item.id, quote);
      }
      if (acceptedQuotes.size === 0) return reply.status(400).send({ error: "Select at least one item to prepare" });
      const totalInPaise = Array.from(acceptedQuotes.values()).reduce((sum, quote) => sum + quote.totalPriceInPaise, 0);
      if (!Number.isSafeInteger(totalInPaise) || totalInPaise < 0 || totalInPaise > MAX_INT) {
        return reply.status(400).send({ error: "Accepted order total exceeds the supported limit" });
      }
      const fullyAccepted = order.items.every((item) => {
        const update = updatesById.get(item.id);
        if ((requestedQuantities.get(item.id) ?? 0) === 0) return false;
        return (update?.acceptedTotalWeightGrams ?? requestedWeights.get(item.id)) === requestedWeights.get(item.id);
      });
      const status = fullyAccepted ? "CONFIRMED" : "PARTIALLY_ACCEPTED";
      const updated = await prisma.$transaction(async (tx) => {
        await Promise.all(order.items.map((item) =>
          tx.orderItem.update({
            where: { id: item.id },
            data: {
              available: (requestedQuantities.get(item.id) ?? 0) > 0,
              quantity: acceptedQuantities.get(item.id) ?? 0,
              totalPriceInPaise: acceptedQuotes.get(item.id)?.totalPriceInPaise || 0,
              unitPriceInPaise: acceptedQuotes.get(item.id)?.unitPriceInPaise || item.unitPriceInPaise,
              pricingUnit: acceptedQuotes.get(item.id)?.pricingUnit || item.pricingUnit,
              acceptedWeightGrams: acceptedQuotes.get(item.id)?.acceptedWeightGrams || null,
              acceptedPackingLabel: (requestedQuantities.get(item.id) ?? 0) > 0
                ? (acceptedQuotes.get(item.id)?.packingLabel || item.acceptedPackingLabel || item.packingLabel)
                : null,
              acceptedPackingWeight: (requestedQuantities.get(item.id) ?? 0) > 0
                ? (acceptedQuotes.get(item.id)?.packingWeight || item.acceptedPackingWeight || item.packingWeight)
                : null,
              fulfillmentNote: updatesById.get(item.id)?.fulfillmentNote || item.fulfillmentNote || null,
            },
          })
        ));
        return tx.order.update({
          where: { id },
          data: { status, totalInPaise },
          include: { pickupSlot: true, items: true, user: { select: { email: true } } },
        });
      });
      void notifyUser(
        order.userId,
        status === "PARTIALLY_ACCEPTED" ? "Order partially confirmed" : "Order confirmed",
        status === "PARTIALLY_ACCEPTED"
          ? "Some requested items or quantities changed. Open your orders to see the store fulfilment details."
          : `Your order ${order.pickupNumber} has been confirmed and is being prepared.`,
        "/orders",
      );
      return reply.send({
        ...updated,
        items: updated.items.map((item) => ({ ...item, product: item.productId ? productsById.get(item.productId) || null : null })),
      });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.post("/lookup", { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const { pickupCode } = pickupCodeSchema.parse(request.body);
      const order = await prisma.order.findUnique({
        where: { pickupNumber: pickupCode.toUpperCase() },
        include: {
          pickupSlot: true,
          items: true,
          user: { select: { email: true } },
        },
      });

      if (!order) {
        return reply.status(404).send({ error: "No order found for this pickup code" });
      }

      return reply.send(order);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.patch("/:id/status", { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { status } = updateOrderStatusSchema.parse(request.body);
      const currentOrder = await prisma.order.findUnique({ where: { id } });
      if (!currentOrder) {
        return reply.status(404).send({ error: "Order not found" });
      }
      if (currentOrder.status === "PICKED_UP" || currentOrder.status === "CANCELLED") {
        return reply.status(409).send({ error: "This order can no longer change status" });
      }
      const allowedTransitions: Record<string, string[]> = {
        // Item-level acceptance is deliberately handled only by /confirm.
        PENDING: ["PENDING", "CANCELLED"],
        PARTIALLY_ACCEPTED: ["PARTIALLY_ACCEPTED", "READY_FOR_PICKUP", "CANCELLED"],
        CONFIRMED: ["CONFIRMED", "READY_FOR_PICKUP", "CANCELLED"],
        READY_FOR_PICKUP: ["READY_FOR_PICKUP", "CANCELLED"],
      };
      if (!allowedTransitions[currentOrder.status]?.includes(status)) {
        return reply.status(409).send({
          error: `Order cannot move from ${currentOrder.status} to ${status}`,
        });
      }

      const order = await prisma.order.update({
        where: { id },
        data: { status },
      });
      void notifyUser(order.userId, "Order status updated", `Your order is now ${status.replaceAll("_", " ").toLowerCase()}.`, "/orders");
      return reply.send(order);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // Admin: verify the customer pickup code before recording payment or collection.
  app.patch("/:id/fulfillment", { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { pickupCode, pickedUp, paymentPaid } = fulfillmentSchema.parse(request.body);
      const order = await prisma.order.findUnique({ where: { id } });

      if (!order) {
        return reply.status(404).send({ error: "Order not found" });
      }
      if (order.pickupNumber !== pickupCode) {
        return reply.status(403).send({ error: "Pickup code does not match this order" });
      }
      if (order.status === "CANCELLED") {
        return reply.status(409).send({ error: "Cancelled orders cannot be fulfilled" });
      }
      if (order.status === "PICKED_UP" && !pickedUp) {
        return reply.status(409).send({ error: "A picked-up order cannot be reverted" });
      }
      if (pickedUp && order.status !== "READY_FOR_PICKUP") {
        return reply.status(409).send({ error: "Only orders ready for pickup can be collected" });
      }
      if (pickedUp && !paymentPaid && order.paymentStatus !== "PAID") {
        return reply.status(409).send({ error: "Payment must be recorded before pickup" });
      }
      if (paymentPaid && !pickedUp && order.paymentStatus !== "PAID") {
        return reply.status(409).send({ error: "Payment can only be recorded while completing pickup" });
      }

      const updated = await prisma.order.update({
        where: { id },
        data: {
          paymentStatus: paymentPaid ? "PAID" : order.paymentStatus,
          ...(pickedUp
            ? {
                status: "PICKED_UP",
                pickedUpAt: new Date(),
                pickedUpById: (request as any).user.id,
              }
            : {}),
        },
        include: {
          pickupSlot: true,
          items: true,
          user: { select: { name: true, email: true } },
        },
      });
      if (pickedUp) {
        void notifyUser(order.userId, "Order picked up", "Your payment was recorded and your order was collected.", "/orders");
      }
      return reply.send(updated);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.post("/:id/verify-pickup", { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { pickupCode } = pickupCodeSchema.parse(request.body);
      const order = await prisma.order.findUnique({ where: { id } });

      if (!order) {
        return reply.status(404).send({ error: "Order not found" });
      }
      if (order.pickupNumber !== pickupCode) {
        return reply.status(403).send({ error: "Pickup code does not match this order" });
      }
      return reply.send({ verified: true });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });
}
