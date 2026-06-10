import Image from "next/image";
import Link from "next/link";
import { PRODUCTS } from "@/lib/constants";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export default function SignatureBlends() {
  const featured = PRODUCTS.filter((p) => p.isFeatured).slice(0, 4);

  return (
    <section className="py-20 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-heading text-3xl font-bold text-brand-dark sm:text-4xl">
                Our Signature Blends
              </h2>
              <p className="mt-3 max-w-md text-brand-gray">
                Explore our most-loved spice collections, curated for authentic
                flavor and uncompromising purity.
              </p>
            </div>
            
          </div>
        </ScrollReveal>

        {/* Product Grid */}
        <div className="mt-8 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {featured.map((product, index) => (
            <ScrollReveal 
              key={product.id} 
              animation="fade-up" 
              delay={`delay-${(index + 1) * 100}`}
              className="h-full"
            >
              <Link
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

                  {/* Link (removed price since it's missing in simplified products) */}
                  <div className="mt-auto pt-2 sm:pt-4 flex items-center justify-between border-t border-brand-border">
                    <span className="text-[10px] sm:text-sm font-bold text-brand-maroon truncate mr-1">
                      {product.price ? `₹${product.price}` : ""}
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
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-8 flex justify-end animate-blink">
          <Link
            href="/products"
            className="group flex items-center gap-2 text-sm font-semibold text-brand-maroon transition-colors hover:text-brand-maroon-dark"
          >
            View All Products
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
