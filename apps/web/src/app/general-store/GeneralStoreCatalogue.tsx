"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { basePriceInPaise, formatLooseRatePerKg, formatPaise, formatWeightGrams, looseUnitTotalInPaise } from "@/lib/general-store-display";

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

type Packing = { label: string; weight?: string; priceInPaise?: number; minQuantity?: number; availability?: string };
type QuickSelection = {
  selectionType: "PACKED" | "LOOSE";
  packingLabel: string;
  packingWeight?: string;
  requestedWeightGrams?: number;
  quantity: number;
  totalInPaise: number;
  label: string;
};

function quickSelection(product: Product): QuickSelection | null {
  const preferred = product.preferredSelection;
  const grams = preferred?.requestedWeightGrams;
  if (product.allowLooseQuantity && preferred?.selectionType === "LOOSE" && grams) {
    const rule = product.loosePricingRules?.find((candidate) => grams >= candidate.minWeightGrams && (candidate.maxWeightGrams == null || grams <= candidate.maxWeightGrams));
    if (rule) return {
      selectionType: "LOOSE",
      packingLabel: "Loose quantity",
      requestedWeightGrams: grams,
      quantity: 1,
      totalInPaise: looseUnitTotalInPaise(rule.rateInPaise, rule.rateUnit, grams),
      label: `Loose ${formatWeightGrams(grams)} · ${formatLooseRatePerKg(rule.rateInPaise, rule.rateUnit)}`,
    };
  }

  const packings: Packing[] = Array.isArray(product.packagingSizes) ? product.packagingSizes : [];
  const available = packings.filter((packing) => typeof packing?.label === "string" && packing.availability !== "UNAVAILABLE");
  const matches = available.filter((packing) => packing.label === preferred?.packingLabel);
  const packing = matches.find((option) => option.weight === preferred?.packingWeight) ?? matches[0] ?? available[0];
  if (!packing && packings.length) return null;

  const quantity = packing?.minQuantity ?? 1;
  return {
    selectionType: "PACKED",
    packingLabel: packing?.label ?? "default",
    packingWeight: packing?.weight,
    quantity,
    totalInPaise: (packing?.priceInPaise ?? basePriceInPaise(product)) * quantity,
    label: `${quantity} × ${packing?.label ?? "Standard pack"}`,
  };
}

export default function GeneralStoreCatalogue({ products }: { products: Product[] }) {
  const { addToCart, loading } = useCart();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState("featured");
  const [adding, setAdding] = useState<string | null>(null);
  const inFlight = useRef(false);
  const [feedback, setFeedback] = useState<{ text: string; success: boolean }>();

  const quickSelections = useMemo(() => new Map(products.map((product) => [product.id, quickSelection(product)])), [products]);
  const categories = useMemo(() => ["ALL", ...Array.from(new Set(products.map((p) => p.categoryDetails?.name || p.category).filter(Boolean) as string[]))], [products]);
  const visible = useMemo(() => products
    .filter((product) => {
      const haystack = `${product.name} ${product.shortDescription || ""} ${product.description || ""}`.toLowerCase();
      const productCategory = product.categoryDetails?.name || product.category;
      return haystack.includes(query.trim().toLowerCase()) && (category === "ALL" || productCategory === category);
    })
    .sort((a, b) => {
      if (sort === "featured") return Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
      const first = quickSelections.get(a.id);
      const second = quickSelections.get(b.id);
      if (!first || !second) return Number(Boolean(second)) - Number(Boolean(first));
      return sort === "price-low" ? first.totalInPaise - second.totalInPaise : second.totalInPaise - first.totalInPaise;
    }), [products, query, category, sort, quickSelections]);

  async function quickAdd(product: Product, selection: QuickSelection) {
    if (inFlight.current) return;
    inFlight.current = true;
    setAdding(product.id);
    setFeedback(undefined);
    try {
      const added = await addToCart(product.id, selection.quantity, selection.packingLabel, selection.packingWeight, selection.selectionType, selection.requestedWeightGrams);
      if (added) setFeedback({ text: `${product.name} added to cart.`, success: true });
    } catch (error) {
      setFeedback({ text: error instanceof Error ? error.message : "We could not add that product. Please try again.", success: false });
    } finally {
      inFlight.current = false;
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
        {feedback && (feedback.success ? (
          <p role="status" className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">{feedback.text} <Link href="/cart" className="font-semibold underline">View cart</Link></p>
        ) : <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{feedback.text}</p>)}

        <div className="mt-8 flex items-center justify-between"><p className="text-sm text-brand-gray">{visible.length} products</p><Link href="/cart" className="text-sm font-semibold text-brand-maroon hover:text-brand-gold">View cart →</Link></div>
        {visible.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-brand-gold/50 bg-white p-12 text-center"><h2 className="font-heading text-xl font-bold text-brand-dark">No products match that search</h2><p className="mt-2 text-sm text-brand-gray">Try another term or clear the filters.</p></div> : (
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {visible.map((product) => {
              const image = Array.isArray(product.images) && typeof product.images[0] === "string" ? product.images[0] : "/images/products/garam-masala.png";
              const selection = quickSelections.get(product.id);
              return <article key={product.id} className="group flex flex-col rounded-2xl border border-brand-border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-card">
                <Link href={`/general-store/${product.slug}`} aria-label={`View ${product.name}`}>
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-brand-cream/30"><Image src={image} alt={product.name} fill className="object-contain p-4 transition group-hover:scale-105" sizes="(max-width: 1024px) 50vw, 25vw" /></div>
                  <h2 className="mt-4 font-heading text-lg font-bold text-brand-dark">{product.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-brand-gray">{product.shortDescription || product.description || "Everyday store product"}</p>
                </Link>
                <div className="mt-auto pt-5">
                  {selection && (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-brand-maroon tabular-nums">{formatPaise(selection.totalInPaise)}</span>
                        <button type="button" onClick={() => void quickAdd(product, selection)} disabled={loading || adding !== null}
                          aria-label={`Quick add ${product.name}`} className="min-h-9 rounded-full bg-brand-maroon px-3 py-2 text-xs font-semibold text-white hover:bg-brand-maroon-dark disabled:opacity-60">
                          {adding === product.id ? "Adding…" : "Quick add"}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-brand-gray">{selection.label}</p>
                    </>
                  )}
                  <Link href={`/general-store/${product.slug}`} className="mt-2 inline-block text-xs font-semibold text-brand-maroon underline-offset-2 hover:underline">Customize weight &amp; packing</Link>
                </div>
              </article>;
            })}
          </div>
        )}
      </div>
    </main>
  );
}
