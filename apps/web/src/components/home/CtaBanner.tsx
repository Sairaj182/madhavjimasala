import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const FLOATING_PARTICLES = [
  { size: 3, top: "20%", right: "15%", delay: 0, duration: 5 },
  { size: 5, top: "60%", right: "25%", delay: 1.5, duration: 6 },
  { size: 2, top: "40%", right: "10%", delay: 0.8, duration: 4.5 },
  { size: 4, top: "75%", right: "35%", delay: 2, duration: 5.5 },
];

export default function CtaBanner() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="relative overflow-hidden rounded-3xl bg-brand-dark noise-overlay">
            {/* Subtle warm gradient wash */}
            <div
              className="absolute inset-0 opacity-15 z-0"
              style={{
                background: "radial-gradient(circle at 30% 50%, rgba(139,26,26,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(212,160,23,0.2) 0%, transparent 50%)",
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
                  background: `radial-gradient(circle, rgba(212,160,23,0.6), rgba(212,160,23,0.1))`,
                  animation: `gentle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
                }}
              />
            ))}

            <div className="grid lg:grid-cols-2 relative z-10">
              {/* Content */}
              <div className="relative p-6 sm:p-10 lg:p-16">
                <span className="section-eyebrow !text-brand-gold/70 mb-4 inline-flex">Business Solutions</span>
                <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                  Scale your business with finest{" "}
                  <span className="text-brand-gold">aromatics.</span>
                </h2>
                <p className="mt-6 max-w-md text-base leading-relaxed text-white/55">
                  Whether you&apos;re a restaurant chain, a retail brand, or a global
                  exporter - Madhavji Masala offers bulk supply, custom blending,
                  and white-label solutions tailored to your needs.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/contact"
                    className="group inline-flex items-center gap-2 rounded-full bg-brand-maroon px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-maroon-light shadow-[0_4px_20px_rgba(139,26,26,0.4)] hover:shadow-[0_8px_30px_rgba(139,26,26,0.6)]"
                  >
                    Get a Quote
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:border-brand-gold/30"
                  >
                    Explore Range
                  </Link>
                </div>

                {/* Stats with gold dividers */}
                <div className="mt-10 flex flex-wrap items-center gap-4 sm:gap-0">
                  <div className="sm:pr-8">
                    <p className="text-2xl sm:text-3xl font-bold font-heading text-brand-gold">93+</p>
                    <p className="mt-1 text-xs text-white/45 font-medium tracking-wide">Years Legacy</p>
                  </div>
                  <div className="hidden sm:block h-10 w-px bg-gradient-to-b from-transparent via-brand-gold/30 to-transparent" />
                  <div className="sm:px-8">
                    <p className="text-2xl sm:text-3xl font-bold font-heading text-brand-gold">10+</p>
                    <p className="mt-1 text-xs text-white/45 font-medium tracking-wide">Products</p>
                  </div>
                  <div className="hidden sm:block h-10 w-px bg-gradient-to-b from-transparent via-brand-gold/30 to-transparent" />
                  <div className="sm:pl-8">
                    <p className="text-2xl sm:text-3xl font-bold font-heading text-brand-gold">15+</p>
                    <p className="mt-1 text-xs text-white/45 font-medium tracking-wide">Cities</p>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="relative hidden lg:block">
                <Image
                  src="/images/madhavjimasala_logo_rct.png"
                  alt="Madhavji Masala warehouse facility"
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/60 to-transparent" />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
