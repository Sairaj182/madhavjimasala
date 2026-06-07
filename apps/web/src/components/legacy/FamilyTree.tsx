'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { generationsData } from '@/lib/data/legacy';

export default function FamilyTree() {
  return (
    <section className="py-16 bg-[var(--color-brand-cream)] overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-4xl font-bold text-[var(--color-brand-maroon)] mb-4 font-[family-name:var(--font-heading)]"
          >
            Generations of Leadership
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base text-[var(--color-brand-gray)]"
          >
            The visionaries who built and nurtured our legacy.
          </motion.p>
        </div>

        {/* Tree Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Vertical Connecting Line */}
          <div className="absolute left-1/2 top-[100px] bottom-[100px] w-[2px] bg-gradient-to-b from-transparent via-[var(--color-brand-gold)] to-transparent -translate-x-1/2 hidden md:block opacity-50" />

          <div className="flex flex-col gap-16 md:gap-24 relative z-10">
            {generationsData.map((gen, genIndex) => (
              <div key={gen.generation} className="flex flex-col items-center">
                
                {/* Generation Label */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="mb-8 px-6 py-2 rounded-full bg-white border border-[var(--color-brand-gold)]/40 shadow-sm text-[var(--color-brand-gold)] font-medium tracking-wide text-sm z-10"
                >
                  {gen.generation}
                </motion.div>

                {/* Members Grid */}
                <div className={`flex flex-row items-center justify-center gap-4 md:gap-20 w-full`}>
                  {gen.members.map((member, memberIndex) => (
                    <motion.div 
                      key={member.name}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: memberIndex * 0.2, duration: 0.5 }}
                      className="flex flex-col items-center text-center group"
                    >
                      {/* Portrait Container */}
                      <div className="relative mb-6">
                        <div className="absolute inset-0 rounded-full bg-[var(--color-brand-gold)] opacity-0 group-hover:opacity-10 scale-110 transition-all duration-500 blur-xl" />
                        <div className="relative w-20 h-20 md:w-40 md:h-40 rounded-full overflow-hidden border-2 md:border-4 border-white shadow-[var(--shadow-card)] group-hover:shadow-[var(--shadow-card-hover)] transition-all duration-500 group-hover:-translate-y-2 group-hover:border-[var(--color-brand-cream-dark)]">
                          <Image 
                            src={member.image}
                            alt={member.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                      </div>
                      
                      {/* Member Info */}
                      <h4 className="text-sm md:text-xl font-bold text-[var(--color-brand-maroon)] mb-1 font-[family-name:var(--font-heading)]">
                        {member.name}
                      </h4>
                      {member.role && (
                        <p className="text-xs md:text-sm font-medium text-[var(--color-brand-gold)]">
                          {member.role}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
