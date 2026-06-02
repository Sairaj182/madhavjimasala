import Image from "next/image";
import Link from "next/link";
import { PRODUCTS } from "@/lib/constants";

export default function SignatureBlends() {
  const featured = PRODUCTS.filter((p) => p.isFeatured).slice(0, 4);

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
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

        {/* Product Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-brand-cream transition-all duration-300 hover:shadow-card-hover"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Category Badge */}
                <div className="absolute left-3 top-3 rounded-full bg-brand-maroon/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  {product.category}
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-heading text-lg font-bold text-brand-dark group-hover:text-brand-maroon transition-colors">
                  {product.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-brand-gray line-clamp-2">
                  {product.shortDescription}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-brand-maroon">
                    From ₹{product.price}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-brand-maroon opacity-0 transition-all duration-300 group-hover:opacity-100">
                    View Details
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
