import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { quoteGeneralStoreSelection, SelectionPricingError } from "./general-store-pricing";

const productFields = {
  id: true, slug: true, name: true, images: true, isGeneralStore: true,
  isActive: true, price: true, priceInPaise: true, packagingSizes: true,
  allowLooseQuantity: true, loosePricingRules: true,
} satisfies Prisma.ProductSelect;

export const storeCartItems = {
  include: { product: { select: productFields } },
  where: { product: { isGeneralStore: true } },
  orderBy: [{ createdAt: "asc" }, { id: "asc" }],
} satisfies Prisma.Cart$itemsArgs;

type StoreCartItem = Prisma.CartItemGetPayload<{ include: typeof storeCartItems.include }>;

export function checkoutHash(parts: unknown[]) {
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}

export function quoteCart(items: StoreCartItem[]) {
  const lines = items.map((item) => {
    try {
      if (!item.product.isActive) throw new SelectionPricingError("This product is currently unavailable.");
      return { item, quote: quoteGeneralStoreSelection(item.product, item), error: null };
    } catch (error) {
      if (!(error instanceof SelectionPricingError)) throw error;
      return { item, quote: null, error: error.message };
    }
  });
  const revision = checkoutHash(lines.map(({ item, quote }) => [
    item.id, item.productId, item.quantity,
    quote?.selectionKey, quote?.packingLabel, quote?.packingWeight, quote?.acceptedWeightGrams,
    quote?.unitPriceInPaise, quote?.pricingUnit, quote?.totalPriceInPaise,
  ]));
  const totalInPaise = lines.reduce((sum, { quote }) => sum + (quote?.totalPriceInPaise ?? 0), 0);
  return { lines, revision, totalInPaise };
}

export function presentCartItem(item: StoreCartItem, quote: ReturnType<typeof quoteGeneralStoreSelection> | null, quoteError: string | null) {
  const { id, slug, name, images } = item.product;
  return {
    id: item.id,
    productId: item.productId,
    product: { id, slug, name, images: Array.isArray(images) ? images.filter((image) => typeof image === "string") : [] },
    quantity: item.quantity,
    packingLabel: quote?.packingLabel ?? item.packingLabel,
    packingWeight: quote?.packingWeight ?? item.packingWeight,
    selectionType: item.selectionType,
    requestedWeightGrams: item.requestedWeightGrams,
    pricingUnit: quote?.pricingUnit ?? null,
    quotedUnitPriceInPaise: quote?.unitPriceInPaise ?? null,
    quotedTotalInPaise: quote?.totalPriceInPaise ?? null,
    quoteError,
  };
}
