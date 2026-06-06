import Image from "next/image";
import Link from "next/link";

export default function CtaBanner() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-dark">
          <div className="grid lg:grid-cols-2">
            {/* Content */}
            <div className="relative z-10 p-6 sm:p-10 lg:p-16">
              <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Scale your business with finest{" "}
                <span className="text-brand-gold">aromatics.</span>
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-white/60">
                Whether you&apos;re a restaurant chain, a retail brand, or a global
                exporter — Madhavji Masala offers bulk supply, custom blending,
                and white-label solutions tailored to your needs.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-maroon px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-maroon-light hover:shadow-[0_8px_30px_rgba(139,26,26,0.4)]"
                >
                  Get a Quote
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
                >
                  Explore Range
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-10 flex flex-wrap gap-4 sm:gap-8">
                <div>
                  <p className="text-2xl font-bold text-brand-gold">40+</p>
                  <p className="mt-1 text-xs text-white/50">Years Legacy</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-gold">100+</p>
                  <p className="mt-1 text-xs text-white/50">Products</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-gold">15+</p>
                  <p className="mt-1 text-xs text-white/50">Countries</p>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative hidden lg:block">
              <Image
                src="/images/about/warehouse.png"
                alt="Madhavji Masala warehouse facility"
                fill
                className="object-cover"
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-dark to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
