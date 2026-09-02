'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ThenAndNow() {
  return (
    <section className="py-20 lg:py-28 bg-brand-maroon-dark text-white relative overflow-hidden noise-overlay">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-gold/10 via-transparent to-transparent opacity-50" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mb-4"
          >
            <span className="section-eyebrow !text-brand-gold/70">Evolution</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl lg:text-4xl font-bold mb-4 font-heading text-white"
          >
            Then & <span className="text-brand-gold">Now</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base text-white/70"
          >
            A visual journey bridging nearly a century of growth and innovation.
          </motion.p>
        </div>

        {/* Split Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto">
          
          {/* Historical */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col group"
          >
            <div className="relative h-[250px] lg:h-[400px] w-full rounded-2xl overflow-hidden mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-brand-gold/20">
              <Image 
                src="/images/about/legacy/MadhavjiNanji.png"
                alt="Historical Madhavji Shop"
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-brand-maroon-dark/20 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-700" />
              <div className="absolute inset-0 ring-1 ring-inset ring-brand-gold/20 rounded-2xl pointer-events-none" />
              
              {/* Badge */}
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-brand-gold px-4 py-1.5 rounded-full text-xs font-bold tracking-widest border border-brand-gold/30 shadow-lg">
                1930s
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold font-heading text-brand-gold mb-3">
              Historical Madhavji
            </h3>
            <p className="text-sm md:text-base text-white/70 leading-relaxed">
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
            <div className="relative h-[250px] lg:h-[400px] w-full rounded-2xl overflow-hidden mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-brand-gold/20">
              <Image 
                src="/images/hero/hero-banner.png"
                alt="Modern Madhavji Masala Facility"
                fill
                className="object-cover transition-all duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-brand-gold/20 rounded-2xl pointer-events-none" />
              
              {/* Badge */}
              <div className="absolute top-4 right-4 bg-brand-gold/90 backdrop-blur-md text-brand-dark px-4 py-1.5 rounded-full text-xs font-bold tracking-widest border border-brand-gold shadow-[0_4px_12px_rgba(212,160,23,0.3)]">
                TODAY
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold font-heading text-brand-gold mb-3">
              Modern Madhavji Masala
            </h3>
            <p className="text-sm md:text-base text-white/70 leading-relaxed">
              State-of-the-art manufacturing facility ensuring consistency and hygiene while preserving traditional flavors.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
