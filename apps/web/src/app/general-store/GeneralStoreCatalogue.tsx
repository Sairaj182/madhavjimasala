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
        <section className="overflow-hidden rounded-3xl border border-brand-gold/20 bg-white shadow-card lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.85fr)]">
          <div className="px-6 py-9 sm:px-10 sm:py-12 lg:px-14">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-maroon">
              <span className="h-px w-8 bg-brand-gold" aria-hidden="true" /> Everyday essentials
            </div>
            <h1 className="mt-5 max-w-2xl font-heading text-3xl font-bold leading-tight text-brand-dark sm:text-4xl lg:text-5xl">Your neighbourhood store, <span className="text-brand-maroon">ready for pickup.</span></h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-brand-gray sm:text-base">Choose a packing, set your quantity, and collect your order from Madhavji Masala.</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-brand-gray">પેકિંગ પસંદ કરો, જથ્થો નક્કી કરો અને તમારો ઓર્ડર સ્ટોર પરથી લઈ જાઓ.</p>
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-cream px-4 py-2 text-sm font-semibold text-brand-maroon">
              <span className="h-2 w-2 rounded-full bg-brand-gold" aria-hidden="true" /> Pay at pickup · ચુકવણી પિકઅપ સમયે
            </div>
          </div>
          <div className="flex flex-col justify-center bg-brand-maroon px-6 py-9 text-white sm:px-10 lg:px-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold-light">New to the store?</p>
            <h2 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">Ordering is simple.</h2>
            <p className="mt-3 text-sm leading-6 text-white/85">Sign in, choose your products, pick a collection time, and follow your order.</p>
            <p className="mt-2 text-sm leading-6 text-white/85">Sign In કરો, વસ્તુઓ પસંદ કરો અને પિકઅપનો સમય નક્કી કરો.</p>
            <figure className="mt-5 overflow-hidden rounded-2xl border border-white/20 bg-brand-dark/20 shadow-lg">
              <video
                className="aspect-video w-full object-cover"
                autoPlay
                controls
                muted
                loop
                playsInline
                preload="metadata"
                poster="/videos/general-store-order-guide-poster.jpg"
                aria-label="Quick video guide showing how to sign up and place a General Store pickup order"
              >
                <source src="/videos/general-store-order-guide.mp4" type="video/mp4" />
                Your browser does not support video playback. Use the How to order guide below.
              </video>
              <figcaption className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">
                Quick guide · Sign up to pickup order
              </figcaption>
            </figure>
            <Link href="/order-guide" className="mt-6 inline-flex w-fit items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-bold text-brand-maroon transition hover:bg-brand-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              How to order <span aria-hidden="true">→</span>
            </Link>
          </div>
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
