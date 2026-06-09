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
      className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-[var(--color-brand-cream)] pt-12"
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
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-brand-cream)] via-transparent to-[var(--color-brand-cream)]" />
      </motion.div>

      <div className="container mx-auto px-4 lg:px-8 z-10">
        <div className="flex flex-row gap-4 lg:gap-20 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-1/2 max-w-2xl"
          >
            <span className="inline-block px-2 md:px-4 py-1 mb-3 md:mb-6 text-[10px] md:text-sm font-semibold tracking-wider text-[var(--color-brand-gold)] border border-[var(--color-brand-gold)]/30 rounded-full bg-[var(--color-brand-gold)]/5">
              EST. 1930
            </span>
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold leading-tight mb-2 md:mb-4 text-[var(--color-brand-maroon)] font-[family-name:var(--font-heading)]">
              Four Generations of Trust, Flavor & Legacy
            </h1>
            <p className="text-xs md:text-base lg:text-lg text-[var(--color-brand-dark-light)] leading-relaxed font-[family-name:var(--font-body)] border-l-2 border-[var(--color-brand-gold)] pl-3 md:pl-6">
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
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-[var(--color-brand-maroon)] rounded-full hover:bg-[var(--color-brand-maroon-dark)] hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl"
                >
                  <p className='animate-blink'>View More</p>
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Right Image with Parallax */}
          <motion.div 
            style={{ y: yImage, opacity }}
            className="w-1/2 relative h-[250px] md:h-[400px] lg:h-[550px] rounded-2xl overflow-hidden shadow-[var(--shadow-elevated)]"
          >
            <Image 
              src="/images/about/legacy/MadhavjiNanji.png"
              alt="Vintage family legacy"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {/* Elegant vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-maroon-dark)]/60 via-transparent to-transparent mix-blend-multiply" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-2xl" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
