'use client';

import { motion } from 'framer-motion';
import { valuesData } from '@/lib/data/legacy';
import { Star, Shield, Leaf, Heart } from 'lucide-react';

// Icon Map to convert string names to components
const IconMap: Record<string, React.ElementType> = {
  Star,
  Shield,
  Leaf,
  Heart,
};

export default function LegacyValues() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
  };

  return (
    <section className="py-16 bg-white relative">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-4xl font-bold text-[var(--color-brand-maroon)] mb-4 font-[family-name:var(--font-heading)]"
          >
            Values Passed Through Generations
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base text-[var(--color-brand-gray)]"
          >
            The core principles that guide every batch of Madhavji Masala.
          </motion.p>
        </div>

        {/* Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
        >
          {valuesData.map((value) => {
            const IconComponent = IconMap[value.icon];

            return (
              <motion.div 
                key={value.title}
                variants={itemVariants}
                className="group p-4 md:p-8 rounded-2xl bg-[var(--color-brand-cream)] border border-[var(--color-brand-border)] hover:border-[var(--color-brand-gold)]/50 transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] relative overflow-hidden"
              >
                {/* Accent glow on hover */}
                <div className="absolute -inset-4 bg-gradient-to-br from-[var(--color-brand-gold)]/0 via-[var(--color-brand-gold)]/0 to-[var(--color-brand-gold)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Icon */}
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3 md:mb-4 text-[var(--color-brand-maroon)] group-hover:text-[var(--color-brand-gold)] group-hover:-translate-y-1 transition-all duration-300">
                  {IconComponent && <IconComponent className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />}
                </div>

                {/* Content */}
                <h3 className="text-base md:text-xl font-bold text-[var(--color-brand-maroon)] mb-1 md:mb-2 font-[family-name:var(--font-heading)]">
                  {value.title}
                </h3>
                <p className="text-xs md:text-sm text-[var(--color-brand-dark-light)] leading-relaxed relative z-10">
                  {value.description}
                </p>
                
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
