"use client";

import { TRUST_FACTORS } from "@/lib/constants";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { motion } from "framer-motion";

export default function TrustFactors() {
  return (
    <section className="bg-brand-cream/90 py-20 lg:py-28 overflow-hidden noise-overlay relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-12 sm:mb-16">
            <span className="section-eyebrow">Why Choose Us</span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-brand-dark sm:text-4xl lg:text-5xl">
              The Madhavji Promise
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-2">
          {TRUST_FACTORS.map((factor, index) => (
            <ScrollReveal 
              key={factor.id} 
              animation="fade-up" 
              delay={`delay-${index * 100}`}
              className="h-full"
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="gold-accent-left group relative rounded-2xl bg-white p-5 sm:p-7 lg:p-9 shadow-card border border-transparent transition-all duration-300 hover:shadow-gold-glow hover:border-brand-gold/20 h-full overflow-hidden"
              >
                {/* Large background number */}
                <span className="absolute -right-2 -top-4 text-[4rem] sm:text-[6rem] font-heading font-bold text-brand-cream-dark/60 leading-none select-none pointer-events-none">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 items-center justify-center rounded-xl bg-brand-maroon/5 text-brand-maroon transition-all duration-300 group-hover:bg-brand-maroon group-hover:text-white group-hover:shadow-[0_4px_16px_rgba(139,26,26,0.25)]">
                  <TrustIcon name={factor.icon} />
                </div>

                {/* Stat Badge */}
                {factor.stat && (
                  <span className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-gold/10 px-3 py-1 text-xs font-bold text-brand-gold shadow-[0_0_12px_rgba(212,160,23,0.1)]">
                    <span className="h-1 w-1 rounded-full bg-brand-gold/60" />
                    {factor.stat}
                  </span>
                )}

                {/* Title & Description */}
                <h3 className="relative mt-3 font-heading text-base sm:text-lg font-bold text-brand-dark">
                  {factor.title}
                </h3>
                <p className="relative mt-1 sm:mt-2 text-xs sm:text-sm leading-relaxed text-brand-gray line-clamp-4 sm:line-clamp-none">
                  {factor.description}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Central tagline */}
        <ScrollReveal animation="fade-up" delay="delay-300">
          <div className="mt-16 text-center">
            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-brand-gold/40" />
              <div className="h-2 w-2 rotate-45 border border-brand-gold/40 bg-brand-gold/10" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-brand-gold/40" />
            </div>
            <h2 className="font-heading text-3xl font-bold text-brand-dark sm:text-4xl">
              Why customers trust{" "}
              <span className="text-brand-gold">Madhavji Masala.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-brand-gray">
              For over four decades, we&apos;ve been the trusted spice partner for
              homes, restaurants, and businesses. Our commitment to
              purity isn&apos;t just a promise — it&apos;s our legacy.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function TrustIcon({ name }: { name: string }) {
  const iconClass = "h-6 w-6";
  switch (name) {
    case "shield-check":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      );
    case "beaker":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      );
    case "globe":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      );
    case "leaf":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      );
    default:
      return null;
  }
}
