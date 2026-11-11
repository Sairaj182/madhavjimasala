export type DisplayRateUnit = "GRAM" | "KILOGRAM" | "PACK" | string | undefined;

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
