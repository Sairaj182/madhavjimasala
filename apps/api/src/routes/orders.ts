import type { FastifyInstance } from "fastify";
import { prisma } from "@repo/db";
import { Prisma } from "@prisma/client";
import { hasAnyRoleFeature, hasRoleFeature } from "../lib/role-permissions";
import { isAdminRole, requireAuth, requireFeature } from "../middleware/auth";
import { z } from "zod";
import { randomInt, randomUUID } from "node:crypto";
import { notifyAdminNewOrder, notifyUser } from "../lib/push";
import { quoteGeneralStoreSelection } from "../lib/general-store-pricing";
import { getGeneralStoreControls } from "../lib/general-store-settings";
import { checkoutHash, quoteCart, storeCartItems } from "../lib/store-cart";
import { StoreRequestError, storeTransaction } from "../lib/store-transaction";
import { isBookablePickup } from "../lib/pickup-time";

const MAX_INT = 2_147_483_647;

const createOrderSchema = z.object({
  pickupSlotId: z.string().min(1).max(120),
  cartRevision: z.string().regex(/^[a-f0-9]{64}$/),
  paymentMethod: z.literal("CASH").default("CASH"),
  customerName: z.string().trim().min(1).max(120),
  pickupPersonName: z.string().trim().min(1).max(120),
});

const orderDetails = { items: true, pickupSlot: true } satisfies Prisma.OrderInclude;

function presentOrder<T extends { idempotencyKey: string | null; pickupNumber: string }>(order: T, canSeePickup: boolean) {
  const { idempotencyKey, pickupNumber, ...details } = order;
  void idempotencyKey;
  return { ...details, ...(canSeePickup ? { pickupNumber } : {}) };
}

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

const orderMessageSchema = z.object({ message: z.string().trim().min(1).max(1200) });
type RawOrderMessage = { id: string; message: string; createdAt: Date; senderId: string; senderName: string; senderRole: string };

function presentOrderMessage(message: RawOrderMessage, exposeStaffName: boolean) {
  const senderName = !exposeStaffName && isAdminRole(message.senderRole) ? "Store team" : message.senderName;
  return { id: message.id, message: message.message, createdAt: message.createdAt, sender: { id: message.senderId, name: senderName, role: message.senderRole } };
}

async function latestMessageRoles(orderIds: string[]) {
  if (!orderIds.length) return new Map<string, string>();
  const rows = await prisma.$queryRaw<{ orderId: string; senderRole: string }[]>`
    SELECT target."id" AS "orderId", latest."senderRole"
    FROM "Order" AS target
    CROSS JOIN LATERAL (
      SELECT sender."role" AS "senderRole"
      FROM "OrderMessage" AS message
      INNER JOIN "user" AS sender ON sender."id" = message."senderId"
      WHERE message."orderId" = target."id"
      ORDER BY message."createdAt" DESC, message."id" DESC
      LIMIT 1
    ) AS latest
    WHERE target."id" IN (${Prisma.join(orderIds)})
  `;
  return new Map(rows.map((row) => [row.orderId, row.senderRole]));
}

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

function findPacking(product: { packagingSizes: unknown }, label: string | undefined, weight?: string | null) {
  const packings = Array.isArray(product.packagingSizes) ? product.packagingSizes : [];
  const matching = packings.filter((packing): packing is { label: string; weight?: string; weightGrams?: number; availability?: string } =>
    typeof packing === "object" && packing !== null && packing.label === label);
  return matching.find((packing) => packing.weight === weight) ?? (matching.length === 1 ? matching[0] : undefined);
}

export async function orderRoutes(app: FastifyInstance) {
  app.addHook("onRequest", async (_request, reply) => { reply.header("Cache-Control", "private, no-store"); });
  app.addHook('preHandler', requireAuth);

  async function visibleOrder(orderId: string, userId: string, role: string | undefined) {
    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true, userId: true } });
    return order && (order.userId === userId || isAdminRole(role)) ? order : null;
  }

  async function hasOrderBoardAccess(role: string | undefined) {
    return hasAnyRoleFeature(role, ["orders.view", "orders.review", "orders.ready", "orders.status", "orders.messages"]);
  }

  async function canUseOrderChat(orderId: string, user: { id: string; role?: string }) {
    const order = await visibleOrder(orderId, user.id, user.role);
    if (!order) return { order: null, allowed: false };
    const allowed = order.userId === user.id || await hasRoleFeature(user.role, "orders.messages");
    return { order, allowed };
  }

  app.get("/:id/messages", async (request, reply) => {
    if (!(await getGeneralStoreControls()).generalStoreChatOpen) return reply.code(503).send({ code: "ORDER_CHAT_DISABLED", error: "Order messaging is currently unavailable." });
    const { id } = request.params as { id: string };
    const user = (request as any).user as { id: string; role?: string };
    const access = await canUseOrderChat(id, user);
    if (!access.order) return reply.code(404).send({ error: "Order not found" });
    if (!access.allowed) return reply.code(403).send({ error: "Your role does not have access to order chat." });

    const messages = await prisma.$queryRaw<RawOrderMessage[]>`
      SELECT message."id", message."message", message."createdAt",
             sender."id" AS "senderId", sender."name" AS "senderName", sender."role" AS "senderRole"
      FROM "OrderMessage" AS message
      INNER JOIN "user" AS sender ON sender."id" = message."senderId"
      WHERE message."orderId" = ${id}
      ORDER BY message."createdAt" DESC, message."id" DESC
      LIMIT 100
    `;
    return reply.send(messages.reverse().map((message) => presentOrderMessage(message, isAdminRole(user.role))));
  });

  app.post("/:id/messages", { bodyLimit: 4096 }, async (request, reply) => {
    if (!(await getGeneralStoreControls()).generalStoreChatOpen) return reply.code(503).send({ code: "ORDER_CHAT_DISABLED", error: "Order messaging is currently unavailable." });
    const { id } = request.params as { id: string };
    const user = (request as any).user as { id: string; name: string; role?: string };
    const parsed = orderMessageSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Message must contain 1 to 1200 characters." });
    const access = await canUseOrderChat(id, user);
    if (!access.order) return reply.code(404).send({ error: "Order not found" });
    if (!access.allowed) return reply.code(403).send({ error: "Your role does not have access to order chat." });

    const [recentMessages] = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count FROM "OrderMessage"
      WHERE "senderId" = ${user.id} AND "createdAt" >= NOW() - INTERVAL '1 minute'
    `;
    if (recentMessages.count >= 10n) return reply.code(429).send({ error: "Please wait a moment before sending more messages." });

    const messageId = randomUUID();
    const createdAt = new Date();
    await prisma.$executeRaw`
      INSERT INTO "OrderMessage" ("id", "orderId", "senderId", "message", "createdAt")
      VALUES (${messageId}, ${id}, ${user.id}, ${parsed.data.message}, ${createdAt})
    `;
    return reply.code(201).send({ id: messageId, message: parsed.data.message, createdAt, sender: { id: user.id, name: user.name, role: user.role ?? "user" } });
  });

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
    const latestRoles = controls.generalStoreChatOpen ? await latestMessageRoles(orders.map((order) => order.id)) : new Map<string, string>();
    return reply.send(orders.map((order) => ({
      ...presentOrder(order, true),
      hasStoreReply: isAdminRole(latestRoles.get(order.id)),
    })));
  });

  app.get("/:id/receipt", async (request, reply) => {
    const userId: string = (request as any).user.id;
    const { id } = request.params as { id: string };
    const order = await prisma.order.findUnique({ where: { id, userId }, include: orderDetails });
    if (!order) return reply.code(404).send({ error: "Order not found" });
    return reply.send(presentOrder(order, true));
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
    const user = (request as any).user as { role?: string };
    const isCustomerOrder = order?.userId === userId;
    const canViewAdminOrder = isAdminRole(user.role) && await hasOrderBoardAccess(user.role);
    if (!order || (!isCustomerOrder && !canViewAdminOrder)) {
      return reply.status(404).send({ error: "Order not found" });
    }
    return reply.send(presentOrder(order, isCustomerOrder || await hasRoleFeature(user.role, "pickup.verify")));
  });

  // One completed order per reviewed cart. A new cart has a new revision, even for identical products.
  app.post("/", { bodyLimit: 8192 }, async (request, reply) => {
    try {
      const userId: string = (request as any).user.id;
      const { pickupSlotId, paymentMethod, customerName, pickupPersonName, cartRevision } = createOrderSchema.parse(request.body);
      const idempotencyKey = checkoutHash(["checkout-v1", userId, cartRevision]);
      const result = await storeTransaction(async (tx) => {
        const existing = await tx.order.findUnique({
          where: { idempotencyKey, userId },
          include: orderDetails,
        });
        if (existing) {
          const sameDetails = existing.pickupSlotId === pickupSlotId
            && existing.customerName === customerName && existing.pickupPersonName === pickupPersonName;
          return { order: existing, created: false, sameDetails };
        }

        const controls = await getGeneralStoreControls(tx);
        if (!controls.generalStoreEnabled || !controls.generalStoreCheckoutOpen || !controls.generalStorePickupOpen || !controls.generalStoreCartOpen) {
          throw new StoreRequestError(503, "CHECKOUT_CLOSED", controls.generalStoreMaintenanceMessage);
        }

        const cart = await tx.cart.findUnique({ where: { userId }, include: { items: storeCartItems } });
        const { lines, revision, totalInPaise } = quoteCart(cart?.items ?? []);
        if (revision !== cartRevision || !cart || !lines.length) {
          throw new StoreRequestError(409, "CART_CHANGED", "Your cart changed. Review the current items and prices before confirming.");
        }
        const orderItems = lines.map(({ item, quote }) => {
          if (!quote) throw new StoreRequestError(409, "CART_CHANGED", "Some cart items changed or are unavailable. Review your cart.");
          return {
            productId: item.productId,
            productName: item.product.name,
            packingLabel: quote.packingLabel,
            packingWeight: quote.packingWeight,
            acceptedPackingLabel: quote.packingLabel,
            acceptedPackingWeight: quote.packingWeight,
            selectionType: quote.selectionType,
            requestedWeightGrams: quote.requestedWeightGrams ?? null,
            acceptedWeightGrams: quote.acceptedWeightGrams,
            pricingUnit: quote.pricingUnit,
            unitPriceInPaise: quote.unitPriceInPaise,
            requestedQuantity: quote.quantity,
            quantity: quote.quantity,
            totalPriceInPaise: quote.totalPriceInPaise,
          };
        });
        if (!Number.isSafeInteger(totalInPaise) || totalInPaise > MAX_INT) {
          throw new StoreRequestError(400, "TOTAL_TOO_LARGE", "Your order total exceeds the supported limit. Reduce the quantities in your cart.");
        }

        const pickupSlot = await tx.pickupSlot.findUnique({
          where: { id: pickupSlotId },
          include: { _count: { select: { orders: { where: { status: { not: "CANCELLED" } } } } } },
        });
        if (!pickupSlot || !isBookablePickup(pickupSlot) || pickupSlot._count.orders >= pickupSlot.capacity) {
          throw new StoreRequestError(409, "PICKUP_UNAVAILABLE", "That pickup slot is no longer available. Please choose another slot.");
        }

        const order = await tx.order.create({
          data: {
            pickupNumber: generatePickupNumber(),
            idempotencyKey,
            userId,
            pickupSlotId,
            customerName,
            pickupPersonName,
            paymentMethod,
            totalInPaise,
            items: { create: orderItems },
          },
          include: orderDetails,
        });

        await tx.cartItem.deleteMany({ where: { cartId: cart.id, id: { in: lines.map(({ item }) => item.id) } } });
        return { order, created: true, sameDetails: true };
      });

      if (!result.sameDetails) {
        return reply.code(409).send({
          code: "ORDER_ALREADY_PLACED", orderId: result.order.id,
          error: "An order was already placed for this cart. Check its pickup details.",
        });
      }
      if (result.created) {
        void Promise.allSettled([
          notifyUser(userId, "Order received", "Your pickup order has been received.", "/orders"),
          notifyAdminNewOrder(result.order.id, result.order.serialNumber),
        ]).then((results) => {
          if (results.some((item) => item.status === "rejected")) request.log.warn("Could not send one or more new-order notifications");
        });
      }
      return reply.code(result.created ? 201 : 200).send(presentOrder(result.order, true));
    } catch (error) {
      if (error instanceof StoreRequestError) return reply.code(error.status).send({ code: error.code, error: error.message });
      if (error instanceof z.ZodError) return reply.code(400).send({ code: "INVALID_CHECKOUT", error: "Enter valid checkout details and review your cart before confirming." });
      request.log.error({ code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined }, "Checkout request failed");
      return reply.code(500).send({ error: "Could not verify whether your order was placed. Please retry the same checkout." });
    }
  });

  // Admin Routes
  app.get("/all", { preHandler: requireAuth }, async (request, reply) => {
    const actor = (request as any).user as { role?: string };
    if (!isAdminRole(actor.role) || !(await hasOrderBoardAccess(actor.role))) {
      return reply.code(403).send({ error: "Your role does not have access to the order board." });
    }
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
    const chatOpen = (await getGeneralStoreControls()).generalStoreChatOpen;
    const latestRoles = chatOpen ? await latestMessageRoles(orders.filter((order) => !["PICKED_UP", "CANCELLED"].includes(order.status)).map((order) => order.id)) : new Map<string, string>();
    return reply.send(orders.map((order) => ({
      ...order,
      customerMessageNeedsReply: Boolean(latestRoles.has(order.id) && !isAdminRole(latestRoles.get(order.id))),
      items: order.items.map((item) => ({ ...item, product: item.productId ? productsById.get(item.productId) || null : null })),
    })));
  });

  app.patch("/:id/confirm", { preHandler: requireFeature("orders.review") }, async (request, reply) => {
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
        const originalPacking = item.selectionType === "PACKED" ? findPacking(product, item.packingLabel, item.packingWeight) : undefined;
        const originalUnitWeight = item.selectionType === "LOOSE" ? item.requestedWeightGrams
          : parseWeightGrams(item.packingWeight) ?? packingWeightGrams(originalPacking);
        if (!originalUnitWeight) {
          if (
            item.selectionType !== "PACKED" || update?.acceptedSelectionType === "LOOSE" ||
            update?.acceptedTotalWeightGrams !== undefined ||
            (update?.acceptedPackingLabel && update.acceptedPackingLabel !== item.packingLabel)
          ) return reply.status(409).send({ error: `${item.productName} can only be prepared in its original quantity without a configured weight` });
          acceptedQuotes.set(item.id, quoteGeneralStoreSelection(product, { ...item, quantity: item.requestedQuantity }));
          acceptedQuantities.set(item.id, item.requestedQuantity);
          continue;
        }
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
          const acceptedPacking = findPacking(product, acceptedLabel, update?.acceptedPackingWeight ?? item.packingWeight);
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
        const transition = await tx.order.updateMany({
          where: { id, status: order.status, updatedAt: order.updatedAt }, data: { status, totalInPaise },
        });
        if (transition.count !== 1) throw new StoreRequestError(409, "ORDER_CHANGED", "The order changed. Refresh and review it again.");
        await Promise.all(order.items.map((item) =>
          tx.orderItem.update({
            where: { id: item.id },
            data: {
              available: (requestedQuantities.get(item.id) ?? 0) > 0,
              quantity: acceptedQuantities.get(item.id) ?? 0,
              totalPriceInPaise: acceptedQuotes.get(item.id)?.totalPriceInPaise ?? 0,
              unitPriceInPaise: acceptedQuotes.get(item.id)?.unitPriceInPaise ?? item.unitPriceInPaise,
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
        return tx.order.findUniqueOrThrow({
          where: { id },
          include: { pickupSlot: true, items: true, user: { select: { email: true } } },
        });
      });
      void notifyUser(
        order.userId,
        status === "PARTIALLY_ACCEPTED" ? "Order partially confirmed" : "Order confirmed",
        status === "PARTIALLY_ACCEPTED"
          ? "Some requested items or quantities changed. Open your orders to see the store fulfilment details."
          : "Your order has been confirmed and is being prepared.",
        "/orders",
      ).catch(() => request.log.warn("Could not send the order review notification"));
      const actor = (request as any).user as { role?: string };
      return reply.send({
        ...presentOrder(updated, await hasRoleFeature(actor.role, "pickup.verify")),
        items: updated.items.map((item) => ({ ...item, product: item.productId ? productsById.get(item.productId) || null : null })),
      });
    } catch (err: any) {
      if (err instanceof StoreRequestError) return reply.code(err.status).send({ error: err.message, code: err.code });
      return reply.status(400).send({ error: err.message });
    }
  });

  app.post("/lookup", { preHandler: requireAuth }, async (request, reply) => {
    try {
      const actor = (request as any).user as { role?: string };
      if (!(await hasAnyRoleFeature(actor.role, ["pickup.verify", "payments.record", "pickup.fulfill"]))) {
        return reply.code(403).send({ error: "Your role cannot verify pickup or record payment." });
      }
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

  app.patch("/:id/status", { preHandler: requireAuth }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { status } = updateOrderStatusSchema.parse(request.body);
      const actor = (request as any).user as { role?: string };
      const allowedToUpdate = status === "READY_FOR_PICKUP"
        ? await hasRoleFeature(actor.role, "orders.ready") || await hasRoleFeature(actor.role, "orders.status")
        : await hasRoleFeature(actor.role, "orders.status");
      if (!allowedToUpdate) return reply.code(403).send({ error: "Your role cannot make this order status change." });
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
        where: { id, status: currentOrder.status, updatedAt: currentOrder.updatedAt },
        data: { status },
      });
      void notifyUser(order.userId, "Order status updated", `Your order is now ${status.replaceAll("_", " ").toLowerCase()}.`, "/orders")
        .catch(() => request.log.warn("Could not send the order status notification"));
      return reply.send(presentOrder(order, await hasRoleFeature(actor.role, "pickup.verify")));
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        return reply.code(409).send({ error: "The order changed. Refresh and try again." });
      }
      return reply.status(400).send({ error: err.message });
    }
  });

  // Admin: verify the customer pickup code before recording payment or collection.
  app.patch("/:id/fulfillment", { preHandler: requireAuth }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { pickupCode, pickedUp, paymentPaid } = fulfillmentSchema.parse(request.body);
      const actor = (request as any).user as { id: string; role?: string };
      const canCompletePickup = await hasRoleFeature(actor.role, "pickup.fulfill");
      if (pickedUp && !canCompletePickup) return reply.code(403).send({ error: "Your role cannot complete pickups." });
      if (!paymentPaid && !pickedUp) return reply.code(400).send({ error: "Choose a permitted fulfillment action." });
      const order = await prisma.order.findUnique({ where: { id } });

      if (!order) {
        return reply.status(404).send({ error: "Order not found" });
      }
      if (paymentPaid && order.paymentStatus !== "PAID" && !(await hasRoleFeature(actor.role, "payments.record"))) {
        return reply.code(403).send({ error: "Your role cannot record cash payments." });
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
      const updated = await prisma.order.update({
        where: { id, status: order.status, updatedAt: order.updatedAt },
        data: {
          paymentStatus: paymentPaid ? "PAID" : order.paymentStatus,
          ...(pickedUp
            ? {
                status: "PICKED_UP",
                pickedUpAt: new Date(),
              pickedUpById: actor.id,
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
        void notifyUser(order.userId, "Order picked up", "Your payment was recorded and your order was collected.", "/orders")
          .catch(() => request.log.warn("Could not send the pickup notification"));
      }
      return reply.send(updated);
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        return reply.code(409).send({ error: "The order changed. Refresh and try again." });
      }
      return reply.status(400).send({ error: err.message });
    }
  });

  app.post("/:id/verify-pickup", { preHandler: requireFeature("pickup.verify") }, async (request, reply) => {
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
