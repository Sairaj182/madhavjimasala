"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HERO_CONTENT } from "@/lib/constants";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const MotionLink = motion.create(Link);

/* Floating spice particle positions */
const PARTICLES = [
  { size: 4, top: "15%", left: "75%", delay: 0, duration: 5 },
  { size: 6, top: "25%", left: "85%", delay: 1.2, duration: 6 },
  { size: 3, top: "60%", left: "70%", delay: 0.5, duration: 4.5 },
  { size: 5, top: "45%", left: "90%", delay: 2, duration: 5.5 },
  { size: 3, top: "80%", left: "80%", delay: 1.8, duration: 4 },
  { size: 4, top: "35%", left: "65%", delay: 0.8, duration: 6.5 },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
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
        {/* Cinematic multi-layer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        {/* Subtle warm color wash */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "linear-gradient(135deg, rgba(139,26,26,0.3) 0%, transparent 50%, rgba(212,160,23,0.2) 100%)",
            backgroundSize: "200% 200%",
            animation: "gradient-shift 8s ease infinite",
          }}
        />
      </div>

      {/* Floating spice particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            left: p.left,
            background: `radial-gradient(circle, rgba(212,160,23,0.8), rgba(212,160,23,0.2))`,
            animation: `gentle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            boxShadow: `0 0 ${p.size * 3}px rgba(212,160,23,0.3)`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {/* Badge */}
          <ScrollReveal animation="fade-in">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-brand-gold/30 bg-white/5 backdrop-blur-md px-4 py-2 text-[10px] font-bold tracking-[0.25em] text-brand-gold-light shadow-[0_0_30px_rgba(212,160,23,0.1)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold-light opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
              </span>
              {HERO_CONTENT.badge}
            </div>
          </ScrollReveal>

          {/* Headline */}
          <ScrollReveal animation="fade-up" delay="delay-100">
            <h1 className="mt-8 font-heading text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-7xl">
              {HERO_CONTENT.headline.split("\n").map((line, i) => (
                <span key={i} className={i === 1 ? "text-brand-gold" : ""}>
                  {i === 1 && (
                    <span className="text-brand-gold-light">
                      {line}
                    </span>
                  )}
                  {i === 0 && line}
                  {i === 0 && <br />}
                </span>
              ))}
            </h1>
          </ScrollReveal>

          {/* Decorative gold line */}
          <ScrollReveal animation="fade-up" delay="delay-150">
            <div className="mt-6 flex items-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-brand-gold to-transparent" />
              <div className="h-1 w-1 rotate-45 bg-brand-gold/60" />
            </div>
          </ScrollReveal>

          {/* Subtitle */}
          <ScrollReveal animation="fade-up" delay="delay-200">
            <p className="mt-5 max-w-lg text-base sm:text-lg leading-relaxed text-white/65 font-light">
              {HERO_CONTENT.subheadline}
            </p>
          </ScrollReveal>

          {/* CTAs */}
          <ScrollReveal animation="fade-up" delay="delay-300">
            <div className="mt-10 flex flex-wrap gap-4">
              <MotionLink
                href={HERO_CONTENT.primaryCta.href}
                whileHover="hover"
                whileTap="tap"
                variants={{
                  hover: { scale: 1.05 },
                  tap: { scale: 0.95 }
                }}
                className="group inline-flex items-center gap-2 rounded-full bg-brand-maroon px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-maroon-dark shadow-[0_4px_20px_rgba(139,26,26,0.4)] hover:shadow-[0_8px_40px_rgba(139,26,26,0.6)]"
              >
                {HERO_CONTENT.primaryCta.label}
                <motion.svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  variants={{
                    hover: { x: 4 }
                  }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </motion.svg>
              </MotionLink>
              <MotionLink
                href={HERO_CONTENT.secondaryCta.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:border-brand-gold/40 hover:bg-white/10"
              >
                {HERO_CONTENT.secondaryCta.label}
              </MotionLink>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Bottom curved wave transition */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
        >
          <path
            d="M0 32C240 64 480 80 720 72C960 64 1200 32 1440 24V80H0V32Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
