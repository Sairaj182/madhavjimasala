"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PRODUCTS, PRODUCT_CATEGORIES } from "@/lib/constants";
import NewsletterSection from "@/components/shared/NewsletterSection";

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.categorySlug === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-dark py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
              The Digital Catalogue
            </p>
            <h1 className="mt-4 font-heading text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Curated Spice{" "}
              <span className="block">Collections</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/60">
              Sourced from ancestral soils, processed with modern precision.
              Explore our range of artisanal masalas and single-origin spices.
            </p>

            {/* Category Filters */}
            <div className="mt-8 flex flex-wrap gap-3">
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`rounded-full px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat.slug
                      ? "bg-white text-brand-dark shadow-lg"
                      : "border border-white/20 text-white/70 hover:border-white/40 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
            {filtered.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group flex flex-col h-full overflow-hidden rounded-2xl border border-brand-border bg-white transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
              >
                
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-white">
                  
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Category ribbon */}
                  <div className="absolute left-0 top-2 sm:top-4 rounded-r-full bg-brand-maroon/90 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-[10px] uppercase tracking-wider text-white">
                    {product.category}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow p-3 sm:p-5">
                  
                  <h3 className="font-heading text-sm sm:text-lg font-bold text-brand-dark transition-colors group-hover:text-brand-maroon line-clamp-1 sm:line-clamp-none">
                    {product.name}
                  </h3>
                  <p className="mt-1 sm:mt-2 text-[10px] sm:text-sm leading-relaxed text-brand-gray line-clamp-2 sm:line-clamp-3">
                    {product.shortDescription}
                  </p>

                  {/* Price & Link */}
                  <div className="mt-auto pt-2 sm:pt-4 flex items-center justify-between border-t border-brand-border">
                    <span className="text-[10px] sm:text-sm font-bold text-brand-maroon truncate mr-1">
                      ₹{product.price}
                    </span>
                    <span className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs font-semibold text-brand-maroon transition-all group-hover:gap-1 sm:group-hover:gap-2">
                      <span className="hidden min-[380px]:inline">Details</span>
                      <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Explore More CTA */}
          <div className="mt-16 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border-2 border-brand-maroon px-8 py-4 text-sm font-semibold text-brand-maroon transition-all duration-300 hover:bg-brand-maroon hover:text-white"
            >
              Explore More Varieties
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <NewsletterSection />
    </>
  );
}
