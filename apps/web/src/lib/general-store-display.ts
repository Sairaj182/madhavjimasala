import type { CartItem } from "@/contexts/CartContext";

export type DisplayRateUnit = string | null | undefined;

export function formatPaise(paise: number) {
  return `₹${(paise / 100).toFixed(2)}`;
}

export function looseUnitTotalInPaise(rateInPaise: number, rateUnit: DisplayRateUnit, grams: number) {
  return rateUnit === "KILOGRAM" ? Math.round(rateInPaise * grams / 1000) : rateInPaise * grams;
}

export function basePriceInPaise(product: { price?: number; priceInPaise?: number | null }) {
  return product.priceInPaise && product.priceInPaise > 0 ? product.priceInPaise : (product.price ?? 0) * 100;
}

export function cartItemDescription(item: CartItem) {
  if (item.selectionType === "LOOSE") return `Loose ${formatWeightGrams(item.requestedWeightGrams)}`;
  const label = item.packingLabel === "default" ? "Standard pack" : item.packingLabel;
  return [label, formatWeightText(item.packingWeight)].filter(Boolean).join(" · ");
}

export function formatWeightGrams(grams: number | null | undefined) {
  if (!grams || !Number.isFinite(grams)) return "";
  return grams >= 1000 ? `${Number((grams / 1000).toFixed(3))} kg` : `${grams} g`;
}

export function formatWeightText(weight: string | null | undefined) {
  if (!weight) return "";
  const match = weight.trim().match(/^(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms|g|gm|gram|grams)$/i);
  if (!match) return weight;
  const value = Number(match[1]);
  const grams = match[2].toLowerCase().startsWith("k") ? value * 1000 : value;
  return formatWeightGrams(grams) || weight;
}

export function looseRateUnit(rules: unknown, grams: number | null | undefined): "GRAM" | "KILOGRAM" | undefined {
  if (!grams || !Array.isArray(rules)) return undefined;
  const rule = rules.find((candidate) => {
    if (typeof candidate !== "object" || candidate === null) return false;
    const item = candidate as { minWeightGrams?: unknown; maxWeightGrams?: unknown };
    const min = typeof item.minWeightGrams === "number" ? item.minWeightGrams : Number(item.minWeightGrams);
    const max = item.maxWeightGrams == null ? null : Number(item.maxWeightGrams);
    return Number.isFinite(min) && grams >= min && (max === null || (Number.isFinite(max) && grams <= max));
  }) as { rateUnit?: unknown } | undefined;
  return rule?.rateUnit === "GRAM" || rule?.rateUnit === "KILOGRAM" ? rule.rateUnit : undefined;
}

/** Display all loose rates in the store's standard customer-facing unit: per kg. */
export function formatLooseRatePerKg(rateInPaise: number, rateUnit: DisplayRateUnit) {
  const perKgInPaise = rateUnit === "GRAM" ? rateInPaise * 1000 : rateInPaise;
  return `₹${(perKgInPaise / 100).toFixed(2)} per kg`;
}

export function formatRate(rateInPaise: number, rateUnit: DisplayRateUnit) {
  if (rateUnit === "GRAM" || rateUnit === "KILOGRAM") return formatLooseRatePerKg(rateInPaise, rateUnit);
  return `₹${(rateInPaise / 100).toFixed(2)} per pack`;
}
