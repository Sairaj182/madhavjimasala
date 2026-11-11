"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { formatLooseRatePerKg, formatWeightGrams } from "@/lib/general-store-display";

type Product = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  priceInPaise?: number;
  images?: unknown;
  category?: string;
  categoryDetails?: { name?: string };
  isFeatured?: boolean;
  packagingSizes?: unknown;
  allowLooseQuantity?: boolean;
  loosePricingRules?: Array<{ minWeightGrams: number; maxWeightGrams?: number | null; rateInPaise: number; rateUnit: "GRAM" | "KILOGRAM" }>;
  preferredSelection?: { selectionType: "PACKED" | "LOOSE"; packingLabel?: string; packingWeight?: string; requestedWeightGrams?: number } | null;
};

function price(product: Product) {
  return (product.priceInPaise && product.priceInPaise > 0 ? product.priceInPaise : (product.price || 0) * 100) / 100;
}

function preferredSelection(product: Product) {
  if (product.preferredSelection?.selectionType === "LOOSE" && product.preferredSelection.requestedWeightGrams) {
    return { ...product.preferredSelection, packingLabel: "Loose quantity", packingWeight: `${product.preferredSelection.requestedWeightGrams}g` };
  }
  if (product.preferredSelection?.selectionType === "PACKED" && product.preferredSelection.packingLabel) return product.preferredSelection;
  const first = Array.isArray(product.packagingSizes) ? product.packagingSizes[0] : null;
  return first && typeof first === "object" && "label" in first
    ? { selectionType: "PACKED" as const, packingLabel: String(first.label), packingWeight: "weight" in first ? String(first.weight) : undefined }
    : { selectionType: "PACKED" as const, packingLabel: "default", packingWeight: undefined };
}

function preferredLabel(product: Product) {
  const selection = preferredSelection(product);
  return selection.selectionType === "LOOSE" ? `1 × ${formatWeightGrams(selection.requestedWeightGrams)} loose` : `1 × ${selection.packingLabel}`;
}

function preferredPrice(product: Product) {
  const selection = preferredSelection(product);
  if (selection.selectionType === "LOOSE" && selection.requestedWeightGrams) {
    const rule = product.loosePricingRules?.find((candidate) => selection.requestedWeightGrams! >= candidate.minWeightGrams && (candidate.maxWeightGrams == null || selection.requestedWeightGrams! <= candidate.maxWeightGrams));
    if (rule) return (rule.rateUnit === "KILOGRAM" ? rule.rateInPaise * selection.requestedWeightGrams / 1000 : rule.rateInPaise * selection.requestedWeightGrams) / 100;
  }
  const packing = Array.isArray(product.packagingSizes) ? product.packagingSizes.find((candidate) => typeof candidate === "object" && candidate !== null && "label" in candidate && (candidate as { label?: unknown }).label === selection.packingLabel) as { priceInPaise?: number } | undefined : undefined;
  return (packing?.priceInPaise || product.priceInPaise || (product.price || 0) * 100) / 100;
}

function preferredRateLabel(product: Product) {
  const selection = preferredSelection(product);
  if (selection.selectionType !== "LOOSE" || !selection.requestedWeightGrams) return "per pack";
  const rule = product.loosePricingRules?.find((candidate) => selection.requestedWeightGrams! >= candidate.minWeightGrams && (candidate.maxWeightGrams == null || selection.requestedWeightGrams! <= candidate.maxWeightGrams));
  return rule ? formatLooseRatePerKg(rule.rateInPaise, rule.rateUnit) : "rate unavailable";
}

export default function GeneralStoreCatalogue({ products }: { products: Product[] }) {
  const { addToCart } = useCart();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState("featured");
  const [adding, setAdding] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const categories = useMemo(() => ["ALL", ...Array.from(new Set(products.map((p) => p.categoryDetails?.name || p.category).filter(Boolean) as string[]))], [products]);
  const visible = useMemo(() => products
    .filter((product) => {
      const haystack = `${product.name} ${product.shortDescription || ""} ${product.description || ""}`.toLowerCase();
      const productCategory = product.categoryDetails?.name || product.category;
      return haystack.includes(query.trim().toLowerCase()) && (category === "ALL" || productCategory === category);
    })
    .sort((a, b) => sort === "price-low" ? price(a) - price(b) : sort === "price-high" ? price(b) - price(a) : Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured))), [products, query, category, sort]);

  async function quickAdd(product: Product) {
    const selection = preferredSelection(product);
    setAdding(product.id);
    setFeedback("");
    try {
      await addToCart(product.id, 1, selection.packingLabel, selection.packingWeight, selection.selectionType, selection.requestedWeightGrams);
      setFeedback(`${product.name} added: ${preferredLabel(product)}.`);
    } catch {
      setFeedback("We could not add that product. Please try again.");
    } finally {
      setAdding(null);
    }
  }

  return (
    <main className="min-h-screen bg-brand-cream/30 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl bg-brand-maroon px-6 py-10 text-white shadow-card sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Everyday essentials</p>
          <h1 className="mt-3 max-w-2xl font-heading text-4xl font-bold sm:text-5xl">Your neighbourhood store, ready for pickup.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/80">Choose a packing, set your quantity, and collect your order from Madhavji Masala. Payment is made at pickup.</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">પેકિંગ પસંદ કરો, જથ્થો નક્કી કરો અને Madhavji Masala પરથી ઓર્ડર લઈ જાઓ. ચુકવણી પિકઅપ સમયે જ થશે.</p>
        </section>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-brand-border bg-white p-4 shadow-sm sm:flex-row">
          <label className="flex flex-1 items-center gap-3 rounded-xl border border-brand-border px-4 py-2">
            <span aria-hidden>⌕</span><span className="sr-only">Search products</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="w-full bg-transparent text-sm outline-none" />
          </label>
          <select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-brand-border px-4 py-2 text-sm">
            {categories.map((item) => <option key={item} value={item}>{item === "ALL" ? "All categories" : item}</option>)}
          </select>
          <select aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-brand-border px-4 py-2 text-sm">
            <option value="featured">Featured first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option>
          </select>
        </div>
        {feedback && <p role="status" className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">{feedback}</p>}

        <div className="mt-8 flex items-center justify-between"><p className="text-sm text-brand-gray">{visible.length} products</p><Link href="/cart" className="text-sm font-semibold text-brand-maroon hover:text-brand-gold">View cart →</Link></div>
        {visible.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-brand-gold/50 bg-white p-12 text-center"><h2 className="font-heading text-xl font-bold text-brand-dark">No products match that search</h2><p className="mt-2 text-sm text-brand-gray">Try another term or clear the filters.</p></div> : (
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {visible.map((product) => {
              const image = Array.isArray(product.images) && typeof product.images[0] === "string" ? product.images[0] : "/images/products/garam-masala.png";
              return <article key={product.id} className="group flex flex-col rounded-2xl border border-brand-border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-card">
                <Link href={`/general-store/${product.slug}`} aria-label={`View ${product.name}`}>
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-brand-cream/30"><Image src={image} alt={product.name} fill className="object-contain p-4 transition group-hover:scale-105" sizes="(max-width: 1024px) 50vw, 25vw" /></div>
                  <h2 className="mt-4 font-heading text-lg font-bold text-brand-dark">{product.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-brand-gray">{product.shortDescription || product.description || "Everyday store product"}</p>
                </Link>
                <div className="mt-auto pt-5"><div className="flex items-center justify-between gap-2"><span className="font-bold text-brand-maroon">₹{preferredPrice(product).toFixed(2)}</span><button type="button" onClick={() => void quickAdd(product)} disabled={adding === product.id} className="rounded-full bg-brand-maroon px-3 py-2 text-xs font-semibold text-white hover:bg-brand-maroon-dark disabled:opacity-60">{adding === product.id ? "Adding…" : "Quick add"}</button></div><p className="mt-2 text-xs text-brand-gray">Quick add: {preferredLabel(product)} · {preferredRateLabel(product)}</p><Link href={`/general-store/${product.slug}`} className="mt-2 inline-block text-xs font-semibold text-brand-maroon underline-offset-2 hover:underline">Customize weight & packing</Link></div>
              </article>;
            })}
          </div>
        )}
      </div>
    </main>
  );
}
