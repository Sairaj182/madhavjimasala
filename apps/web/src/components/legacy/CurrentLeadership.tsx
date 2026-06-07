'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { currentLeadershipData } from '@/lib/data/legacy';

export default function CurrentLeadership() {
  return (
    <section className="py-16 bg-[var(--color-brand-cream)] relative">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-4xl font-bold text-[var(--color-brand-maroon)] mb-4 font-[family-name:var(--font-heading)]"
          >
            Leading the Legacy Forward
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base text-[var(--color-brand-gray)]"
          >
            The visionaries carrying the Madhavji name into a new era of growth and innovation.
          </motion.p>
        </div>

        {/* Leadership Grid */}
        <div className="flex flex-row justify-center gap-4 lg:gap-24">
          {currentLeadershipData.map((leader, index) => (
            <motion.div 
              key={leader.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center group max-w-sm w-full"
            >
              <div className="relative mb-8 p-2">
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-full bg-[var(--color-brand-gold)] opacity-0 group-hover:opacity-30 blur-2xl transition-all duration-700" />
                
                {/* Portrait */}
                <div className="relative w-24 h-24 md:w-48 md:h-48 lg:w-64 lg:h-64 rounded-full overflow-hidden border-2 md:border-4 border-[var(--color-brand-gold)]/20 shadow-xl group-hover:border-[var(--color-brand-gold)] transition-colors duration-500 z-10 bg-white">
                  <Image 
                    src={leader.image}
                    alt={leader.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="text-center p-3 md:p-6 bg-white rounded-2xl shadow-[var(--shadow-card)] w-full border border-transparent group-hover:border-[var(--color-brand-gold)]/30 transition-all duration-500 transform group-hover:-translate-y-2">
                <h3 className="text-base md:text-xl font-bold text-[var(--color-brand-maroon)] mb-1 md:mb-2 font-[family-name:var(--font-heading)]">
                  {leader.name}
                </h3>
                <div className="h-[2px] w-8 md:w-12 bg-[var(--color-brand-gold)] mx-auto mb-2 md:mb-3" />
                <p className="text-[var(--color-brand-gray)] uppercase tracking-widest text-[10px] md:text-xs font-semibold">
                  {leader.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
