import type { FastifyInstance } from "fastify";
import { prisma } from "@repo/db";
import { requireAuth } from "../middleware/auth";
import { z } from "zod";
import { quoteGeneralStoreSelection } from "../lib/general-store-pricing";
import { getGeneralStoreControls } from "../lib/general-store-settings";

const addItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(100000).default(1),
  packingLabel: z.string().trim().min(1).max(80).default("default"),
  packingWeight: z.string().trim().max(40).optional(),
  selectionType: z.enum(["PACKED", "LOOSE"]).default("PACKED"),
  requestedWeightGrams: z.number().int().min(1).max(1000000).optional(),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(1).max(100000),
});

export async function cartRoutes(app: FastifyInstance) {
  // All cart routes require authentication
  app.addHook('preHandler', requireAuth);

  app.get("/", async (request, reply) => {
    const controls = await getGeneralStoreControls();
    if (!controls.generalStoreEnabled || !controls.generalStoreCartOpen) return reply.status(503).send({ error: controls.generalStoreMaintenanceMessage });
    const userId = (request as any).user.id;
    
    // Find or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          where: { product: { isGeneralStore: true } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } }
      });
    }

    return reply.send(cart);
  });

  app.post("/items", async (request, reply) => {
    try {
      const controls = await getGeneralStoreControls();
      if (!controls.generalStoreEnabled || !controls.generalStoreCartOpen) return reply.status(503).send({ error: controls.generalStoreMaintenanceMessage });
      const userId = (request as any).user.id;
      const selection = addItemSchema.parse(request.body);

      // Ensure user has a cart
      let cart = await prisma.cart.findUnique({ where: { userId } });
      if (!cart) {
        cart = await prisma.cart.create({ data: { userId } });
      }

      // Check if product exists
      const product = await prisma.product.findUnique({ where: { id: selection.productId } });
      if (!product) return reply.status(404).send({ error: "Product not found" });
      if (!product.isActive) return reply.status(409).send({ error: "This product is currently unavailable" });
      if (!product.isGeneralStore) {
        return reply.status(400).send({ error: "Brand products are available for bulk inquiry, not cart checkout" });
      }

      const quote = quoteGeneralStoreSelection(product, selection);
      const existingItem = await prisma.cartItem.findUnique({ where: { cartId_productId_selectionKey: { cartId: cart.id, productId: selection.productId, selectionKey: quote.selectionKey } } });
      const finalQuantity = (existingItem?.quantity || 0) + quote.quantity;
      // Loose selections quote a weight-based total for each requested unit;
      // packed selections quote a per-unit price. Both need to accumulate when
      // the same option is added again.
      const finalTotal = quote.selectionType === "LOOSE"
        ? (quote.totalPriceInPaise / quote.quantity) * finalQuantity
        : quote.unitPriceInPaise * finalQuantity;

      // Upsert cart item
      const cartItem = await prisma.cartItem.upsert({
        where: {
          cartId_productId_selectionKey: {
            cartId: cart.id,
            productId: selection.productId,
            selectionKey: quote.selectionKey
          }
        },
        create: {
          cartId: cart.id,
          productId: selection.productId,
          quantity: quote.quantity,
          packingLabel: quote.packingLabel || "default",
          packingWeight: selection.packingWeight,
          selectionType: quote.selectionType,
          selectionKey: quote.selectionKey,
          requestedWeightGrams: quote.requestedWeightGrams ?? null
          ,quotedUnitPriceInPaise: quote.unitPriceInPaise,
          quotedTotalInPaise: finalTotal
        },
        update: {
          quantity: { increment: quote.quantity },
          ...(selection.packingWeight ? { packingWeight: selection.packingWeight } : {}),
          requestedWeightGrams: quote.requestedWeightGrams ?? null,
          quotedUnitPriceInPaise: quote.unitPriceInPaise,
          quotedTotalInPaise: finalTotal,
        },
        include: { product: true }
      });

      return reply.send(cartItem);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.put("/items/:id", async (request, reply) => {
    try {
      const controls = await getGeneralStoreControls();
      if (!controls.generalStoreEnabled || !controls.generalStoreCartOpen) return reply.status(503).send({ error: controls.generalStoreMaintenanceMessage });
      const userId = (request as any).user.id;
      const { id } = request.params as { id: string };
      const { quantity } = updateItemSchema.parse(request.body);

      const cartItem = await prisma.cartItem.findUnique({
        where: { id },
        include: { cart: true, product: true }
      });

      if (!cartItem || cartItem.cart.userId !== userId) {
        return reply.status(404).send({ error: "Cart item not found" });
      }

      const quote = quoteGeneralStoreSelection(cartItem.product, {
        quantity,
        selectionType: cartItem.selectionType,
        packingLabel: cartItem.packingLabel,
        packingWeight: cartItem.packingWeight,
        requestedWeightGrams: cartItem.requestedWeightGrams,
      });
      const updated = await prisma.cartItem.update({
        where: { id },
        data: { quantity: quote.quantity, quotedUnitPriceInPaise: quote.unitPriceInPaise, quotedTotalInPaise: quote.totalPriceInPaise },
        include: { product: true }
      });

      return reply.send(updated);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.delete("/items/:id", async (request, reply) => {
    try {
      const controls = await getGeneralStoreControls();
      if (!controls.generalStoreEnabled || !controls.generalStoreCartOpen) return reply.status(503).send({ error: controls.generalStoreMaintenanceMessage });
      const userId = (request as any).user.id;
      const { id } = request.params as { id: string };

      const cartItem = await prisma.cartItem.findUnique({
        where: { id },
        include: { cart: true }
      });

      if (!cartItem || cartItem.cart.userId !== userId) {
        return reply.status(404).send({ error: "Cart item not found" });
      }

      await prisma.cartItem.delete({ where: { id } });
      return reply.status(204).send();
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });
}
