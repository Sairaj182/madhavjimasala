'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ThenAndNow() {
  return (
    <section className="py-16 bg-[var(--color-brand-maroon-dark)] text-white relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <Image 
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop"
          alt="Texture"
          fill
          className="object-cover"
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-4xl font-bold mb-4 font-[family-name:var(--font-heading)] text-[var(--color-brand-cream)]"
          >
            Then & Now
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base text-[var(--color-brand-cream-dark)] opacity-90"
          >
            A visual journey bridging nearly a century of growth and innovation.
          </motion.p>
        </div>

        {/* Split Comparison */}
        <div className="grid grid-cols-2 gap-4 lg:gap-12 max-w-6xl mx-auto">
          
          {/* Historical */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col group"
          >
            <div className="relative h-[150px] lg:h-[400px] w-full rounded-2xl overflow-hidden mb-4 md:mb-6 shadow-2xl">
              <Image 
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop"
                alt="Historical Madhavji Shop"
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-2xl" />
              <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-black/60 backdrop-blur-sm text-[var(--color-brand-cream)] px-2 md:px-4 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-semibold tracking-wider">
                1930s
              </div>
            </div>
            <h3 className="text-base md:text-xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-brand-gold)] mb-1 md:mb-2">
              Historical Madhavji
            </h3>
            <p className="text-xs md:text-base text-[var(--color-brand-cream-dark)] opacity-80 leading-relaxed">
              Our humble beginnings as a small family enterprise built purely on word-of-mouth trust and unmatched quality.
            </p>
          </motion.div>

          {/* Modern */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex flex-col group"
          >
            <div className="relative h-[150px] lg:h-[400px] w-full rounded-2xl overflow-hidden mb-4 md:mb-6 shadow-2xl">
              <Image 
                src="https://images.unsplash.com/photo-1621946028120-c08b535d4bdf?q=80&w=2069&auto=format&fit=crop"
                alt="Modern Madhavji Masala Facility"
                fill
                className="object-cover transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-2xl" />
              <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-[var(--color-brand-gold)]/90 backdrop-blur-sm text-[var(--color-brand-maroon-dark)] px-2 md:px-4 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-semibold tracking-wider">
                Today
              </div>
            </div>
            <h3 className="text-base md:text-xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-brand-gold)] mb-1 md:mb-2">
              Modern Madhavji Masala
            </h3>
            <p className="text-xs md:text-base text-[var(--color-brand-cream-dark)] opacity-80 leading-relaxed">
              State-of-the-art manufacturing facility ensuring consistency and hygiene while preserving traditional flavors.
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
