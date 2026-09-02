import Image from "next/image";
import Link from "next/link";
import { PRODUCTS } from "@/lib/constants";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export default function SignatureBlends() {
  const featured = PRODUCTS.filter((p) => p.isFeatured).slice(0, 4);

  return (
    <section className="py-20 lg:py-28 overflow-hidden noise-overlay">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <span className="section-eyebrow">Our Collection</span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-brand-dark sm:text-4xl lg:text-5xl">
              Our Signature Blends
            </h2>
            <p className="mx-auto mt-4 max-w-md text-brand-gray">
              Explore our most-loved spice collections, curated for authentic
              flavor and uncompromising purity.
            </p>
            {/* Decorative underline */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-brand-gold/60" />
              <div className="h-1.5 w-1.5 rotate-45 bg-brand-gold/50" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-brand-gold/60" />
            </div>
          </div>
        </ScrollReveal>

        {/* Product Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((product, index) => (
            <ScrollReveal
              key={product.id}
              animation="fade-up"
              delay={`delay-${(index + 1) * 100}`}
              className="h-full"
            >
              <Link
                href={`/products/${product.slug}`}
                className="animated-border-card group flex flex-col h-full overflow-hidden border border-brand-border transition-all duration-500 hover:shadow-[0_0_30px_rgba(139,26,26,0.15)] hover:border-transparent hover:-translate-y-2 relative bg-transparent"
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
            </ScrollReveal>
          ))}
        </div>

        {/* CTA */}
        <ScrollReveal animation="fade-up" delay="delay-400">
          <div className="mt-14 flex justify-center">
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 rounded-full border border-brand-maroon/30 bg-white px-8 py-3.5 text-sm font-semibold text-brand-maroon transition-all duration-300 hover:bg-brand-maroon hover:text-white hover:border-brand-maroon hover:shadow-[0_8px_30px_rgba(139,26,26,0.3)]"
            >
              View All Signature Blends
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
