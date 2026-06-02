import Image from "next/image";
import Link from "next/link";
import { HERO_CONTENT } from "@/lib/constants";

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={HERO_CONTENT.backgroundImage}
          alt="Premium Indian spices"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="animate-fade-in inline-flex items-center gap-2 rounded-full bg-brand-gold/20 px-4 py-1.5 text-xs font-semibold tracking-widest text-brand-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            {HERO_CONTENT.badge}
          </div>

          {/* Headline */}
          <h1 className="mt-6 font-heading text-5xl font-bold leading-[1.1] text-white sm:text-6xl lg:text-7xl"
              style={{ animation: "slide-up 0.8s ease-out 0.1s both" }}>
            {HERO_CONTENT.headline.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/70"
             style={{ animation: "slide-up 0.8s ease-out 0.3s both" }}>
            {HERO_CONTENT.subheadline}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-4"
               style={{ animation: "slide-up 0.8s ease-out 0.5s both" }}>
            <Link
              href={HERO_CONTENT.primaryCta.href}
              className="group inline-flex items-center gap-2 rounded-full bg-brand-maroon px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-maroon-dark hover:shadow-[0_8px_30px_rgba(139,26,26,0.4)]"
            >
              {HERO_CONTENT.primaryCta.label}
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
            <Link
              href={HERO_CONTENT.secondaryCta.href}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:border-white/60 hover:bg-white/10"
            >
              {HERO_CONTENT.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
