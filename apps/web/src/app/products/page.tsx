"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PRODUCTS, PRODUCT_CATEGORIES } from "@/lib/constants";
import NewsletterSection from "@/components/shared/NewsletterSection";
import SectionDivider from "@/components/shared/SectionDivider";

const FLOATING_PARTICLES = [
  { size: 4, top: "20%", right: "15%", delay: 0.2, duration: 5.5 },
  { size: 3, top: "60%", right: "10%", delay: 1.0, duration: 4.8 },
  { size: 5, top: "35%", left: "15%", delay: 0.8, duration: 6 },
  { size: 2, top: "75%", left: "25%", delay: 1.5, duration: 5 },
];

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.categorySlug === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-dark py-16 lg:py-24 overflow-hidden">
        {/* Subtle warm gradient wash */}
        <div
          className="absolute inset-0 opacity-20 z-0"
          style={{
            background: "radial-gradient(circle at 70% 30%, rgba(139,26,26,0.3) 0%, transparent 60%)",
          }}
        />

        {/* Floating particles */}
        {FLOATING_PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none z-0"
            style={{
              width: p.size,
              height: p.size,
              top: p.top,
              right: p.right,
              left: p.left,
              background: `radial-gradient(circle, rgba(212,160,23,0.6), rgba(212,160,23,0.1))`,
              animation: `gentle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <span className="section-eyebrow !text-brand-gold/70">The Digital Catalogue</span>
            <h1 className="mt-4 font-heading text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Curated Spice{" "}
              <span className="block text-brand-gold mt-1">Collections</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70">
              Sourced from ancestral soils, processed with modern precision.
              Explore our range of artisanal masalas and single-origin spices.
            </p>

            {/* Category Filters */}
            <div className="mt-10 flex flex-wrap gap-3">
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 ${
                    activeCategory === cat.slug
                      ? "bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-white shadow-[0_4px_20px_rgba(139,26,26,0.4)] border border-transparent"
                      : "border border-brand-gold/30 bg-white/5 backdrop-blur-sm text-white/80 hover:border-brand-gold hover:text-white hover:bg-white/10"
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
      <section className="py-16 lg:py-24 noise-overlay">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="animated-border-card group flex flex-col h-full overflow-hidden border border-brand-border bg-transparent transition-all duration-500 hover:shadow-[0_0_30px_rgba(139,26,26,0.15)] hover:border-transparent hover:-translate-y-2 relative"
              >
                {/* Inner Content Wrapper */}
                <div className="flex flex-col h-full relative z-10 rounded-[inherit] overflow-hidden">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-brand-cream/30 to-white">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain p-3 transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {/* Category ribbon */}
                    <div className="absolute left-0 top-2 sm:top-4 rounded-r-full bg-gradient-to-r from-brand-maroon to-brand-maroon-dark px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-[10px] uppercase tracking-wider text-white font-semibold shadow-sm">
                      {product.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-grow p-3 sm:p-5 bg-white">
                    <h3 className="font-heading text-sm sm:text-lg font-bold text-brand-dark transition-colors group-hover:text-brand-maroon line-clamp-1 sm:line-clamp-none">
                      {product.name}
                    </h3>
                    <p className="mt-1 sm:mt-2 text-[10px] sm:text-sm leading-relaxed text-brand-gray line-clamp-2 sm:line-clamp-3">
                      {product.shortDescription}
                    </p>

                    {/* Price & Link */}
                    <div className="mt-auto pt-2 sm:pt-4 flex items-center justify-between border-t border-brand-border/60">
                      <span className="text-[10px] sm:text-sm font-bold text-brand-maroon truncate mr-1">
                        {product.price ? `₹${product.price}` : ""}
                      </span>
                      <span className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs font-semibold text-brand-maroon transition-all group-hover:gap-1 sm:group-hover:gap-2">
                        <span className="hidden min-[380px]:inline">Details</span>
                        <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Explore More CTA */}
          <div className="mt-16 text-center">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full border border-brand-maroon/30 px-8 py-3.5 text-sm font-semibold text-brand-maroon transition-all duration-300 hover:bg-brand-maroon hover:text-white hover:border-brand-maroon hover:shadow-[0_8px_30px_rgba(139,26,26,0.3)]"
            >
              Request Custom Blend
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <SectionDivider variant="line" />

      <NewsletterSection />
    </>
  );
}
