const MAX_INT = 2_147_483_647;

type ProductForPricing = {
  price: number;
  priceInPaise?: number | null;
  allowLooseQuantity?: boolean;
  packagingSizes: unknown;
  loosePricingRules: unknown;
};

export type SelectionInput = {
  selectionType?: string;
  packingLabel?: string;
  packingWeight?: string | null;
  requestedWeightGrams?: number | null;
  quantity: number;
};

export type SelectionQuote = SelectionInput & {
  selectionType: "PACKED" | "LOOSE";
  selectionKey: string;
  unitPriceInPaise: number;
  totalPriceInPaise: number;
  pricingUnit: "PACK" | "GRAM" | "KILOGRAM";
  acceptedWeightGrams: number | null;
};

function basePrice(product: ProductForPricing) {
  return product.priceInPaise && product.priceInPaise > 0 ? product.priceInPaise : product.price * 100;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function quoteGeneralStoreSelection(product: ProductForPricing, input: SelectionInput): SelectionQuote {
  const quantity = input.quantity;
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100000) throw new Error("Quantity must be between 1 and 100000");

  if (input.selectionType === "LOOSE") {
    if (!product.allowLooseQuantity) throw new Error("Loose quantity is not available for this product");
    const grams = numberValue(input.requestedWeightGrams);
    if (!grams || !Number.isInteger(grams) || grams < 1 || grams > 1000000) throw new Error("Loose quantity must be a whole number of grams");
    const rules = Array.isArray(product.loosePricingRules) ? product.loosePricingRules : [];
    const rule = rules.find((candidate) => {
      if (typeof candidate !== "object" || candidate === null) return false;
      const item = candidate as { minWeightGrams?: unknown; maxWeightGrams?: unknown };
      const min = numberValue(item.minWeightGrams);
      const max = item.maxWeightGrams == null ? null : numberValue(item.maxWeightGrams);
      return min !== null && grams >= min && (max === null || (max !== null && grams <= max));
    }) as { rateInPaise?: unknown; rateUnit?: unknown } | undefined;
    if (!rule || !["GRAM", "KILOGRAM"].includes(String(rule.rateUnit))) throw new Error("No valid loose-quantity price applies to this weight");
    const rate = numberValue(rule.rateInPaise);
    if (rate === null) throw new Error("Loose-quantity price is invalid");
    const unitTotal = String(rule.rateUnit) === "KILOGRAM" ? Math.round(rate * grams / 1000) : rate * grams;
    const total = unitTotal * quantity;
    if (!Number.isSafeInteger(total) || total < 0 || total > MAX_INT) throw new Error("Selection price exceeds the supported limit");
    return { ...input, selectionType: "LOOSE", selectionKey: `loose-${grams}`, unitPriceInPaise: rate, totalPriceInPaise: total, pricingUnit: String(rule.rateUnit) as "GRAM" | "KILOGRAM", acceptedWeightGrams: grams };
  }

  const packings = Array.isArray(product.packagingSizes) ? product.packagingSizes : [];
  const selected = packings.find((candidate) => typeof candidate === "object" && candidate !== null && (candidate as { label?: unknown }).label === (input.packingLabel || "default")) as { label?: string; weight?: string; priceInPaise?: unknown; availability?: unknown; minQuantity?: unknown; maxQuantity?: unknown; weightGrams?: unknown } | undefined;
  if (packings.length > 0 && !selected) throw new Error("Selected packing is not available for this product");
  if (selected?.availability === "UNAVAILABLE") throw new Error("Selected packing is currently unavailable");
  const min = numberValue(selected?.minQuantity);
  const max = numberValue(selected?.maxQuantity);
  if (min !== null && quantity < min) throw new Error(`Minimum quantity for this packing is ${min}`);
  if (max !== null && quantity > max) throw new Error(`Maximum quantity for this packing is ${max}`);
  const unitPriceInPaise = numberValue(selected?.priceInPaise) ?? basePrice(product);
  const weightGrams = numberValue(selected?.weightGrams) ?? null;
  const label = selected?.label || input.packingLabel || "default";
  const total = unitPriceInPaise * quantity;
  if (!Number.isSafeInteger(total) || total > MAX_INT) throw new Error("Selection price exceeds the supported limit");
  return { ...input, quantity, selectionType: "PACKED", packingLabel: label, selectionKey: `packed-${label}-${input.packingWeight || ""}`, unitPriceInPaise, totalPriceInPaise: total, pricingUnit: "PACK", acceptedWeightGrams: weightGrams };
}
