'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LegacyHeroProps {
  showCta?: boolean;
}

export default function LegacyHero({ showCta = false }: LegacyHeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const yBackground = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const yImage = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section 
      ref={ref}
      className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-brand-cream noise-overlay pt-12"
    >
      {/* Texture Background */}
      <motion.div 
        style={{ y: yBackground }}
        className="absolute inset-0 z-0 opacity-10"
      >
        <Image 
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop"
          alt="Spice texture background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-cream via-transparent to-brand-cream" />
      </motion.div>

      <div className="container mx-auto px-4 lg:px-8 z-10 relative">
        <div className="flex flex-row gap-4 lg:gap-20 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-1/2 max-w-2xl"
          >
            {/* Premium EST badge */}
            <span className="inline-flex items-center gap-2 px-3 md:px-5 py-1.5 mb-3 md:mb-6 text-[10px] md:text-xs font-bold tracking-[0.2em] text-brand-gold border border-brand-gold/30 rounded-full bg-brand-gold/5 shadow-[0_0_20px_rgba(212,160,23,0.08)]">
              <svg className="h-3 w-3 text-brand-gold/70" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              EST. 1930
            </span>
            <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold leading-tight mb-2 md:mb-4 font-heading">
              <span className="text-brand-maroon">Four Generations</span>
              <br />
              <span className="text-brand-gold">of Trust, Flavor & Legacy</span>
            </h2>
            <p className="text-xs md:text-base lg:text-lg text-brand-dark-light leading-relaxed font-body border-l-2 border-brand-gold pl-3 md:pl-6">
              From a small family enterprise founded in 1930 to a trusted name in spices today, the Madhavji story is one of dedication, quality and family values.
            </p>

            {showCta && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                className="mt-6 md:mt-8"
              >
                <Link 
                  href="/legacy" 
                  className="group inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-brand-maroon rounded-full hover:bg-brand-maroon-dark transition-all duration-300 hover:shadow-[0_8px_30px_rgba(139,26,26,0.35)] hover:-translate-y-0.5"
                >
                  Discover Our Legacy
                  <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Decorative vertical line (desktop) */}
          <div className="hidden lg:flex flex-col items-center gap-2 self-stretch py-12">
            <div className="flex-1 w-px bg-gradient-to-b from-transparent via-brand-gold/30 to-transparent" />
            <div className="h-2 w-2 rotate-45 border border-brand-gold/40 bg-brand-gold/10" />
            <div className="flex-1 w-px bg-gradient-to-b from-transparent via-brand-gold/30 to-transparent" />
          </div>

          {/* Right Image with Parallax & Vintage Frame */}
          <motion.div 
            style={{ y: yImage, opacity }}
            className="w-1/2 relative h-[250px] md:h-[400px] lg:h-[550px]"
          >
            {/* Outer decorative frame */}
            <div className="absolute -inset-2 sm:-inset-3 border border-brand-gold/20 rounded-2xl pointer-events-none" />
            <div className="absolute -inset-1 border border-brand-gold/10 rounded-2xl pointer-events-none" />
            
            {/* Image container */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-elevated">
              <Image 
                src="/images/about/legacy/MadhavjiNanji.png"
                alt="Vintage family legacy"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              {/* Elegant vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-maroon-dark/50 via-transparent to-transparent" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
            </div>

            {/* Floating gold accent dots */}
            <div className="absolute -top-4 -right-4 h-3 w-3 rounded-full bg-brand-gold/30 animate-[gentle-float_4s_ease-in-out_infinite]" />
            <div className="absolute -bottom-3 -left-3 h-2 w-2 rounded-full bg-brand-gold/20 animate-[gentle-float_5s_ease-in-out_1s_infinite]" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
