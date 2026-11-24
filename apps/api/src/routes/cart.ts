import type { FastifyInstance } from "fastify";
import { prisma } from "@repo/db";
import { Prisma } from "@prisma/client";
import { requireAuth } from "../middleware/auth";
import { z } from "zod";
import { quoteGeneralStoreSelection, SelectionPricingError } from "../lib/general-store-pricing";
import { getGeneralStoreControls } from "../lib/general-store-settings";
import { presentCartItem, quoteCart, storeCartItems } from "../lib/store-cart";
import { StoreRequestError, storeTransaction } from "../lib/store-transaction";

const addItemSchema = z.object({
  productId: z.string().min(1).max(120),
  quantity: z.number().int().min(1).max(100000).default(1),
  packingLabel: z.string().trim().min(1).max(80).default("default"),
  packingWeight: z.string().trim().max(40).optional(),
  selectionType: z.enum(["PACKED", "LOOSE"]).default("PACKED"),
  requestedWeightGrams: z.number().int().min(1).max(1000000).optional(),
});

const updateItemSchema = z.union([
  z.strictObject({ quantity: z.number().int().min(1).max(100000) }),
  z.strictObject({ quantityDelta: z.union([z.literal(-1), z.literal(1)]) }),
]);

async function checkCartOpen(db?: Prisma.TransactionClient) {
  const controls = await getGeneralStoreControls(db);
  if (!controls.generalStoreEnabled || !controls.generalStoreCartOpen) {
    throw new StoreRequestError(503, "CART_CLOSED", controls.generalStoreMaintenanceMessage);
  }
}

function quoteFields(quote: ReturnType<typeof quoteGeneralStoreSelection>) {
  return {
    quantity: quote.quantity,
    packingLabel: quote.packingLabel,
    packingWeight: quote.packingWeight,
    selectionType: quote.selectionType,
    selectionKey: quote.selectionKey,
    requestedWeightGrams: quote.requestedWeightGrams ?? null,
    quotedUnitPriceInPaise: quote.unitPriceInPaise,
    quotedTotalInPaise: quote.totalPriceInPaise,
  };
}

export async function cartRoutes(app: FastifyInstance) {
  app.addHook("onRequest", async (_request, reply) => { reply.header("Cache-Control", "private, no-store"); });
  app.addHook("preHandler", requireAuth);
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof StoreRequestError) return reply.code(error.status).send({ code: error.code, error: error.message });
    if (error instanceof SelectionPricingError) return reply.code(409).send({ code: "INVALID_SELECTION", error: error.message });
    if (error instanceof z.ZodError) return reply.code(400).send({ error: "Invalid cart item or quantity." });
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode && statusCode < 500) return reply.send(error);
    request.log.error({ code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined }, "Cart request failed");
    return reply.code(500).send({ error: "Could not update or load the cart. Please try again." });
  });

  app.get("/", async (request, reply) => {
    await checkCartOpen();
    const userId = (request as any).user.id;
    const cart = await prisma.cart.findUnique({ where: { userId }, include: { items: storeCartItems } });
    const { lines, revision, totalInPaise } = quoteCart(cart?.items ?? []);
    return reply.send({
      id: cart?.id ?? null,
      items: lines.map(({ item, quote, error }) => presentCartItem(item, quote, error)),
      revision,
      totalInPaise,
    });
  });

  app.post("/items", async (request, reply) => {
    const selection = addItemSchema.parse(request.body);
    const userId = (request as any).user.id;
    const item = await storeTransaction(async (tx) => {
      await checkCartOpen(tx);
      const product = await tx.product.findUnique({ where: { id: selection.productId } });
      if (!product?.isGeneralStore) throw new StoreRequestError(404, "PRODUCT_NOT_FOUND", "General Store product not found.");
      if (!product.isActive) throw new SelectionPricingError("This product is currently unavailable.");

      const selected = quoteGeneralStoreSelection(product, selection);
      const cart = await tx.cart.upsert({ where: { userId }, create: { userId }, update: {}, select: { id: true } });
      const candidates = await tx.cartItem.findMany({
        where: {
          cartId: cart.id, productId: product.id, selectionType: selected.selectionType,
          ...(selected.selectionType === "LOOSE" ? { requestedWeightGrams: selected.requestedWeightGrams } : {}),
        },
        orderBy: { createdAt: "asc" },
      });
      const existing = candidates.find((line) => line.selectionKey === selected.selectionKey)
        ?? candidates.find((line) => {
          try {
            return quoteGeneralStoreSelection(product, { ...line, quantity: selection.quantity }).selectionKey === selected.selectionKey;
          } catch (error) {
            if (error instanceof SelectionPricingError) return false;
            throw error;
          }
        });
      if (!existing) return tx.cartItem.create({
        data: { cartId: cart.id, productId: product.id, ...quoteFields(selected) },
        include: storeCartItems.include,
      });

      const updated = quoteGeneralStoreSelection(product, { ...selected, quantity: existing.quantity + selection.quantity });
      return tx.cartItem.update({
        where: { id: existing.id }, data: quoteFields(updated), include: storeCartItems.include,
      });
    });
    return reply.send(presentCartItem(item, quoteGeneralStoreSelection(item.product, item), null));
  });

  app.put("/items/:id", async (request, reply) => {
    const change = updateItemSchema.parse(request.body);
    const userId = (request as any).user.id;
    const { id } = request.params as { id: string };
    const item = await storeTransaction(async (tx) => {
      await checkCartOpen(tx);
      const line = await tx.cartItem.findFirst({
        where: { id, cart: { userId }, product: { isGeneralStore: true } }, include: storeCartItems.include,
      });
      if (!line) throw new StoreRequestError(404, "ITEM_NOT_FOUND", "This cart item is no longer available.");
      const quantity = "quantityDelta" in change ? line.quantity + change.quantityDelta : change.quantity;
      if (quantity === 0) {
        await tx.cartItem.delete({ where: { id } });
        return null;
      }
      if (!line.product.isActive) throw new SelectionPricingError("This product is currently unavailable.");
      const quote = quoteGeneralStoreSelection(line.product, { ...line, quantity });
      return tx.cartItem.update({
        where: { id },
        data: { quantity, quotedUnitPriceInPaise: quote.unitPriceInPaise, quotedTotalInPaise: quote.totalPriceInPaise },
        include: storeCartItems.include,
      });
    });
    if (!item) return reply.code(204).send();
    return reply.send(presentCartItem(item, quoteGeneralStoreSelection(item.product, item), null));
  });

  app.delete("/items/:id", async (request, reply) => {
    await checkCartOpen();
    const userId = (request as any).user.id;
    const { id } = request.params as { id: string };
    await prisma.cartItem.deleteMany({ where: { id, cart: { userId } } });
    return reply.code(204).send();
  });
}
