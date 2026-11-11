"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { formatLooseRatePerKg } from "@/lib/general-store-display";

type Packing = { label: string; weight: string; weightGrams?: number; priceInPaise?: number; availability?: string; minQuantity?: number; maxQuantity?: number };
type GeneralStoreProduct = {
  id: string;
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  price: number;
  priceInPaise?: number;
  images?: unknown;
  packagingSizes?: unknown;
  allowLooseQuantity?: boolean;
  loosePricingRules?: Array<{ minWeightGrams: number; maxWeightGrams?: number | null; rateInPaise: number; rateUnit: "GRAM" | "KILOGRAM" }>;
};

const DEFAULT_PACKING: Packing = { label: "Standard pack", weight: "1 unit" };

function getPackings(value: unknown): Packing[] {
  if (!Array.isArray(value)) return [DEFAULT_PACKING];
  const valid = value.filter((packing): packing is Packing => (
    typeof packing === "object" && packing !== null &&
    typeof (packing as Packing).label === "string" &&
    typeof (packing as Packing).weight === "string"
  ));
  return valid.length > 0 ? valid : [DEFAULT_PACKING];
}

function getImages(value: unknown): string[] {
  const valid = Array.isArray(value) ? value.filter((image): image is string => typeof image === "string" && image.length > 0) : [];
  return valid.length > 0 ? valid : ["/images/products/garam-masala.png"];
}

function supportsLooseWeight(rules: GeneralStoreProduct["loosePricingRules"], grams: number) {
  return rules?.some((rule) => grams >= rule.minWeightGrams && (rule.maxWeightGrams == null || grams <= rule.maxWeightGrams)) ?? false;
}

function formatWeight(grams: number) {
  return grams >= 1000 ? `${grams / 1000} kg` : `${grams} g`;
}

export default function GeneralStoreProductDetail({ product }: { product: GeneralStoreProduct }) {
  const { addToCart, loading } = useCart();
  const packings = getPackings(product.packagingSizes);
  const images = getImages(product.images);
  const [selectedPacking, setSelectedPacking] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [looseWeightGrams, setLooseWeightGrams] = useState(() => supportsLooseWeight(product.loosePricingRules, 100) ? 100 : product.loosePricingRules?.[0]?.minWeightGrams || 100);
  const [looseUnit, setLooseUnit] = useState<"GRAMS" | "KILOGRAMS">("GRAMS");
  const [selectionType, setSelectionType] = useState<"PACKED" | "LOOSE">("PACKED");
  const [feedback, setFeedback] = useState("");
  const selected = packings[selectedPacking];
  const looseRule = product.loosePricingRules?.find((rule) => looseWeightGrams >= rule.minWeightGrams && (rule.maxWeightGrams == null || looseWeightGrams <= rule.maxWeightGrams));
  const unitPrice = selectionType === "LOOSE" ? (looseRule ? (looseRule.rateUnit === "KILOGRAM" ? looseRule.rateInPaise * looseWeightGrams / 1000 : looseRule.rateInPaise * looseWeightGrams) / 100 : 0) : (selected.priceInPaise || product.priceInPaise || product.price * 100) / 100;
  const isUnavailable = selected.availability === "UNAVAILABLE";
  const looseWeightOptions = [10, 50, 100, 150, 250, 500, 1000, 1500, 2000, 2500, 5000, 10000]
    .filter((grams) => supportsLooseWeight(product.loosePricingRules, grams));
  const looseInputValue = looseUnit === "GRAMS" ? looseWeightGrams : looseWeightGrams / 1000;
  const updateLooseInput = (value: number) => {
    const grams = looseUnit === "GRAMS" ? value : value * 1000;
    setLooseWeightGrams(Math.max(1, Math.min(1000000, Number.isFinite(grams) ? grams : 1)));
  };
  const totalPrice = unitPrice * quantity;

  return (
    <main className="min-h-screen bg-brand-cream/30 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link href="/general-store" className="text-sm font-semibold text-brand-maroon hover:text-brand-gold">
          ← Back to General Store
        </Link>

        <div className="mt-6 grid gap-8 rounded-3xl border border-brand-border bg-white p-5 shadow-card sm:p-8 lg:grid-cols-2 lg:p-10">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-cream/30">
              <Image src={images[selectedImage] || images[0]} alt={product.name} fill priority className="object-contain p-8" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button key={image} type="button" onClick={() => setSelectedImage(index)} className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border ${selectedImage === index ? "border-brand-maroon ring-2 ring-brand-maroon/20" : "border-brand-border"}`}>
                    <Image src={image} alt={`${product.name} image ${index + 1}`} fill className="object-contain p-1" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">General Store</p>
            <h1 className="mt-3 font-heading text-3xl font-bold text-brand-maroon sm:text-4xl">{product.name}</h1>
            <p className="mt-3 text-sm text-brand-gray">{product.shortDescription || product.description || "A quality everyday product available for store pickup."}</p>
            <p className="mt-2 text-sm text-brand-gray">સ્ટોર પરથી પિકઅપ માટે ઉપલબ્ધ ગુણવત્તાવાળી દૈનિક જરૂરિયાતની વસ્તુ.</p>
            <p className="mt-6 text-2xl font-bold text-brand-dark">₹{unitPrice.toFixed(2)} <span className="text-sm font-normal text-brand-gray">{selectionType === "LOOSE" ? `for ${formatWeight(looseWeightGrams)}` : "per pack"}</span></p>
            {product.description && product.shortDescription && <p className="mt-4 leading-relaxed text-brand-gray">{product.description}</p>}

            <div className="mt-8">
              <p className="text-sm font-semibold text-brand-dark">Choose how you want it</p>
              <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => setSelectionType("PACKED")} className={`rounded-full px-4 py-2 text-sm font-semibold ${selectionType === "PACKED" ? "bg-brand-maroon text-white" : "border border-brand-gold/40"}`}>Pre-packed</button>{product.allowLooseQuantity && <button type="button" onClick={() => setSelectionType("LOOSE")} className={`rounded-full px-4 py-2 text-sm font-semibold ${selectionType === "LOOSE" ? "bg-brand-maroon text-white" : "border border-brand-gold/40"}`}>Loose quantity</button>}</div>
              {selectionType === "PACKED" && <>
              <p className="mt-5 text-sm font-semibold text-brand-dark">Packing / weight</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {packings.map((packing, index) => (
                  <button key={`${packing.label}-${packing.weight}`} type="button" disabled={packing.availability === "UNAVAILABLE"} onClick={() => { setSelectedPacking(index); setQuantity(packing.minQuantity || 1); }} className={`rounded-full px-4 py-2 text-sm font-semibold ${selectedPacking === index ? "bg-brand-maroon text-white" : "border border-brand-gold/40 bg-white text-brand-dark hover:border-brand-maroon"} disabled:cursor-not-allowed disabled:opacity-40`}>
                    {packing.label} {packing.availability === "UNAVAILABLE" ? "(unavailable)" : ""}
                  </button>
                ))}
              </div>
              </>}
              {selectionType === "LOOSE" && <div className="mt-4 rounded-2xl border border-brand-gold/30 bg-brand-cream/20 p-4"><p className="text-sm font-semibold text-brand-dark">How much would you like?</p><p className="mt-1 text-xs text-brand-gray">Choose a usual quantity or enter your own amount.</p><div className="mt-3 flex flex-wrap gap-2">{looseWeightOptions.map((grams) => <button key={grams} type="button" onClick={() => setLooseWeightGrams(grams)} className={`rounded-full px-3 py-2 text-sm font-semibold ${looseWeightGrams === grams ? "bg-brand-maroon text-white" : "border border-brand-gold/40 bg-white text-brand-dark hover:border-brand-maroon"}`}>{formatWeight(grams)}</button>)}</div><label htmlFor="loose-quantity" className="mt-4 block text-xs font-semibold uppercase tracking-wide text-brand-gray">Enter exact quantity</label><div className="mt-1 flex flex-wrap items-center gap-2"><input id="loose-quantity" type="number" min={looseUnit === "GRAMS" ? 1 : 0.001} max={looseUnit === "GRAMS" ? 1000000 : 1000} step={looseUnit === "GRAMS" ? 1 : 0.01} value={looseInputValue} onChange={(event) => updateLooseInput(Number(event.target.value))} className="w-36 rounded-lg border border-brand-border px-3 py-2" /><div className="flex rounded-lg border border-brand-border bg-white p-1" role="group" aria-label="Loose quantity unit"><button type="button" onClick={() => setLooseUnit("GRAMS")} className={`rounded-md px-3 py-2 text-xs font-bold ${looseUnit === "GRAMS" ? "bg-brand-maroon text-white" : "text-brand-gray"}`}>grams</button><button type="button" onClick={() => setLooseUnit("KILOGRAMS")} className={`rounded-md px-3 py-2 text-xs font-bold ${looseUnit === "KILOGRAMS" ? "bg-brand-maroon text-white" : "text-brand-gray"}`}>kg</button></div></div><p className="mt-2 text-xs text-brand-gray">{looseRule ? `${formatLooseRatePerKg(looseRule.rateInPaise, looseRule.rateUnit)} · Your amount: ₹${unitPrice.toFixed(2)}` : "This amount is not currently available. Try one of the suggested amounts."}</p></div>}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <label htmlFor="general-store-quantity" className="text-sm font-semibold text-brand-dark">{selectionType === "LOOSE" ? "Number of units" : "Quantity"}</label>
              <input id="general-store-quantity" type="number" min={selected.minQuantity || 1} max={selected.maxQuantity || 100000} value={quantity} onChange={(event) => setQuantity(Math.min(selected.maxQuantity || 100000, Math.max(selected.minQuantity || 1, Number(event.target.value) || selected.minQuantity || 1)))} className="w-24 rounded-lg border border-brand-border px-3 py-2 text-center" />
              <span className="text-sm text-brand-gray">{selectionType === "LOOSE" ? `${formatWeight(looseWeightGrams)} each · ` : ""}Total ₹{totalPrice.toFixed(2)}</span>
            </div>

            <button type="button" disabled={loading || isUnavailable || (selectionType === "LOOSE" && !looseRule)} onClick={async () => { const packing = packings[selectedPacking]; setFeedback(""); try { await addToCart(product.id, quantity, selectionType === "LOOSE" ? "Loose quantity" : packing.label, selectionType === "LOOSE" ? `${looseWeightGrams}g` : packing.weight, selectionType, selectionType === "LOOSE" ? looseWeightGrams : undefined); setFeedback("Added to cart. You can continue shopping or checkout."); } catch { setFeedback("Unable to add this item. Please try again."); } }} className="mt-8 rounded-full bg-brand-maroon px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-maroon-dark disabled:opacity-60">
              {loading ? "Adding..." : "Add to Cart"}
            </button>
            {feedback && <p role="status" className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{feedback}</p>}
            <p className="mt-3 text-xs text-brand-gray">Payment is collected in store when you pick up your order.</p>
            <p className="mt-1 text-xs text-brand-gray">ઓર્ડર લઈ જતી વખતે સ્ટોર પર જ ચુકવણી કરવાની રહેશે.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
