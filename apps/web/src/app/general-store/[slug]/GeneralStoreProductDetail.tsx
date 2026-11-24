"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { basePriceInPaise, formatLooseRatePerKg, formatPaise, looseUnitTotalInPaise } from "@/lib/general-store-display";

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

const DEFAULT_PACKING: Packing = { label: "default", weight: "1 unit" };

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
  const firstAvailable = Math.max(0, packings.findIndex((packing) => packing.availability !== "UNAVAILABLE"));
  const images = getImages(product.images);
  const [selectedPacking, setSelectedPacking] = useState(firstAvailable);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(packings[firstAvailable].minQuantity ?? 1);
  const [quantityInput, setQuantityInput] = useState(String(packings[firstAvailable].minQuantity ?? 1));
  const [looseWeightGrams, setLooseWeightGrams] = useState(() => supportsLooseWeight(product.loosePricingRules, 100) ? 100 : product.loosePricingRules?.[0]?.minWeightGrams || 100);
  const [looseUnit, setLooseUnit] = useState<"GRAMS" | "KILOGRAMS">("GRAMS");
  const [looseWeightInput, setLooseWeightInput] = useState(() => String(supportsLooseWeight(product.loosePricingRules, 100) ? 100 : product.loosePricingRules?.[0]?.minWeightGrams || 100));
  const [selectionType, setSelectionType] = useState<"PACKED" | "LOOSE">("PACKED");
  const [feedback, setFeedback] = useState<{ text: string; success: boolean }>();
  const [adding, setAdding] = useState(false);
  const addingRef = useRef(false);
  const draftKey = `general-store-selection:${product.id}`;
  const selected = packings[selectedPacking];
  const looseRule = product.loosePricingRules?.find((rule) => looseWeightGrams >= rule.minWeightGrams && (rule.maxWeightGrams == null || looseWeightGrams <= rule.maxWeightGrams));
  const isLoose = selectionType === "LOOSE";
  const unitPrice = isLoose
    ? (looseRule ? looseUnitTotalInPaise(looseRule.rateInPaise, looseRule.rateUnit, looseWeightGrams) : null)
    : selected.priceInPaise ?? basePriceInPaise(product);
  const minimum = isLoose ? 1 : selected.minQuantity ?? 1;
  const maximum = isLoose ? 100000 : selected.maxQuantity ?? 100000;
  const isUnavailable = isLoose ? unitPrice === null : selected.availability === "UNAVAILABLE";
  const looseInputGrams = looseUnit === "GRAMS" ? Number(looseWeightInput) : Number(looseWeightInput) * 1000;
  const quantityValid = quantityInput !== "" && Number.isSafeInteger(Number(quantityInput))
    && Number(quantityInput) >= minimum && Number(quantityInput) <= maximum;
  const looseWeightValid = !isLoose || (looseWeightInput !== "" && Number.isSafeInteger(looseInputGrams)
    && looseInputGrams >= 1 && looseInputGrams <= 1000000);
  const looseWeightOptions = [10, 50, 100, 150, 250, 500, 1000, 1500, 2000, 2500, 5000, 10000]
    .filter((grams) => supportsLooseWeight(product.loosePricingRules, grams));
  const updateLooseInput = (value: string) => {
    setLooseWeightInput(value);
    if (!value) return;
    const entered = Number(value);
    if (!Number.isFinite(entered) || entered <= 0) return;
    const grams = looseUnit === "GRAMS" ? entered : entered * 1000;
    if (Number.isSafeInteger(grams) && grams <= 1000000) setLooseWeightGrams(grams);
  };

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      const storedPackings = getPackings(product.packagingSizes);
      const index = storedPackings.findIndex((packing) => packing.label === draft.label && packing.weight === draft.weight);
      if (draft.selectionType === "LOOSE" && product.allowLooseQuantity && Number.isSafeInteger(draft.grams)) {
        setSelectionType("LOOSE");
        setLooseWeightGrams(Math.max(1, Math.min(1000000, draft.grams)));
        setLooseWeightInput(String(Math.max(1, Math.min(1000000, draft.grams))));
        if (Number.isSafeInteger(draft.quantity)) setQuantity(Math.max(1, Math.min(100000, draft.quantity)));
      } else if (index >= 0) {
        setSelectedPacking(index);
        const packing = storedPackings[index];
        if (Number.isSafeInteger(draft.quantity)) {
          const restoredQuantity = Math.max(packing.minQuantity ?? 1, Math.min(packing.maxQuantity ?? 100000, draft.quantity));
          setQuantity(restoredQuantity);
          setQuantityInput(String(restoredQuantity));
        }
      }
    } catch {
      // Selection is still available when tab storage is disabled.
    }
  }, [draftKey, product.allowLooseQuantity, product.packagingSizes]);

  async function addSelection() {
    if (addingRef.current || loading || isUnavailable || !quantityInput || !Number.isSafeInteger(Number(quantityInput))
      || Number(quantityInput) < minimum || Number(quantityInput) > maximum
      || (isLoose && (!looseWeightInput || !Number.isSafeInteger(looseUnit === "GRAMS" ? Number(looseWeightInput) : Number(looseWeightInput) * 1000)))) return;
    setFeedback(undefined);
    setAdding(true);
    addingRef.current = true;
    try {
      try {
        sessionStorage.setItem(draftKey, JSON.stringify({ selectionType, label: selected.label, weight: selected.weight, grams: looseWeightGrams, quantity }));
      } catch {}
      const added = await addToCart(product.id, quantity, selected.label, selected.weight, selectionType, isLoose ? looseWeightGrams : undefined);
      if (added) {
        try { sessionStorage.removeItem(draftKey); } catch {}
        setFeedback({ text: "Added to cart.", success: true });
      }
    } catch (error) {
      setFeedback({ text: error instanceof Error ? error.message : "Unable to add this item. Please try again.", success: false });
    } finally {
      addingRef.current = false;
      setAdding(false);
    }
  }

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
            <p className="mt-6 text-2xl font-bold text-brand-dark">{unitPrice === null ? "Price unavailable" : formatPaise(unitPrice)}{unitPrice !== null && <span className="ml-2 text-sm font-normal text-brand-gray">{isLoose ? `for ${formatWeight(looseWeightGrams)}` : "per pack"}</span>}</p>
            {product.description && product.shortDescription && <p className="mt-4 leading-relaxed text-brand-gray">{product.description}</p>}

            <div className="mt-8">
              <p className="text-sm font-semibold text-brand-dark">Choose how you want it</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" aria-pressed={!isLoose} onClick={() => {
                  if (isLoose) { setSelectionType("PACKED"); setQuantity(selected.minQuantity ?? 1); setQuantityInput(String(selected.minQuantity ?? 1)); }
                }} className={`rounded-full px-4 py-2 text-sm font-semibold ${!isLoose ? "bg-brand-maroon text-white" : "border border-brand-gold/40 bg-white text-brand-dark"}`}>Pre-packed</button>
                {product.allowLooseQuantity && <button type="button" aria-pressed={isLoose} onClick={() => {
                  if (!isLoose) { setSelectionType("LOOSE"); setQuantity(1); setQuantityInput("1"); }
                }} className={`rounded-full px-4 py-2 text-sm font-semibold ${isLoose ? "bg-brand-maroon text-white" : "border border-brand-gold/40 bg-white text-brand-dark"}`}>Loose quantity</button>}
              </div>
              {!isLoose ? (
                <>
                  <p className="mt-5 text-sm font-semibold text-brand-dark">Packing / weight</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {packings.map((packing, index) => (
                      <button key={`${packing.label}-${packing.weight}`} type="button" aria-pressed={selectedPacking === index} disabled={packing.availability === "UNAVAILABLE"}
                        onClick={() => { setSelectedPacking(index); setQuantity(packing.minQuantity ?? 1); setQuantityInput(String(packing.minQuantity ?? 1)); }}
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${selectedPacking === index ? "bg-brand-maroon text-white" : "border border-brand-gold/40 bg-white text-brand-dark"} disabled:opacity-40`}>
                        {packing.label === "default" ? "Standard pack" : packing.label}{packings.some((other, otherIndex) => otherIndex !== index && other.label === packing.label) && ` · ${packing.weight}`}
                        {packing.availability === "UNAVAILABLE" && " (unavailable)"}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-2xl border border-brand-gold/30 bg-brand-cream/20 p-4">
                  <p className="text-sm font-semibold text-brand-dark">How much would you like?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {looseWeightOptions.map((grams) => (
                      <button key={grams} type="button" aria-pressed={looseWeightGrams === grams} onClick={() => setLooseWeightGrams(grams)}
                        className={`rounded-full px-3 py-2 text-sm font-semibold ${looseWeightGrams === grams ? "bg-brand-maroon text-white" : "border border-brand-gold/40 bg-white text-brand-dark"}`}>{formatWeight(grams)}</button>
                    ))}
                  </div>
                  <label htmlFor="loose-quantity" className="mt-4 block text-sm font-semibold text-brand-gray">Enter exact weight</label>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <input id="loose-quantity" type="number" min={looseUnit === "GRAMS" ? 1 : 0.001} max={looseUnit === "GRAMS" ? 1000000 : 1000}
                      step={looseUnit === "GRAMS" ? 1 : 0.001} value={looseWeightInput} onChange={(event) => updateLooseInput(event.target.value)} className="w-32 rounded-lg border border-brand-border bg-white px-3 py-2" />
                    <select aria-label="Loose quantity unit" value={looseUnit} onChange={(event) => { const unit = event.target.value === "GRAMS" ? "GRAMS" : "KILOGRAMS"; setLooseUnit(unit); setLooseWeightInput(String(unit === "GRAMS" ? looseWeightGrams : looseWeightGrams / 1000)); }}
                      className="rounded-lg border border-brand-border bg-white p-2 text-sm">
                      <option value="GRAMS">Grams</option>
                      <option value="KILOGRAMS">Kilograms</option>
                    </select>
                  </div>
                  <p className="mt-2 text-xs text-brand-gray">{looseRule ? formatLooseRatePerKg(looseRule.rateInPaise, looseRule.rateUnit) : "This weight is unavailable. Try one of the suggested amounts."}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <label htmlFor="general-store-quantity" className="text-sm font-semibold text-brand-dark">{isLoose ? "Number of units" : "Quantity"}</label>
              <input id="general-store-quantity" type="number" min={minimum} max={maximum} value={quantityInput}
                onChange={(event) => {
                  const value = event.target.value;
                  setQuantityInput(value);
                  if (!value) return;
                  const entered = Number(value);
                  if (Number.isSafeInteger(entered) && entered >= minimum && entered <= maximum) setQuantity(entered);
                }}
                className="w-24 rounded-lg border border-brand-border px-3 py-2 text-center" />
              {unitPrice !== null && <span className="text-sm text-brand-gray">{isLoose && `${formatWeight(looseWeightGrams)} each · `}Total <strong className="text-brand-dark">{formatPaise(unitPrice * quantity)}</strong></span>}
            </div>

            <button type="button" disabled={loading || adding || isUnavailable || !quantityValid || !looseWeightValid}
              onClick={() => void addSelection()}
              className="mt-6 rounded-full bg-brand-maroon px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-maroon-dark disabled:opacity-60">
              {adding ? "Adding…" : "Add to Cart"}
            </button>
            {feedback && (feedback.success ? (
              <p role="status" className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{feedback.text} <Link href="/cart" className="font-semibold underline">View cart</Link></p>
            ) : <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{feedback.text}</p>)}
            <p className="mt-3 text-xs text-brand-gray">Payment is collected in store when you pick up your order.</p>
            <p className="mt-1 text-xs text-brand-gray">ઓર્ડર લઈ જતી વખતે સ્ટોર પર જ ચુકવણી કરવાની રહેશે.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
