'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { timelineData } from '@/lib/data/legacy';

export default function JourneyTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center']
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section className="py-16 bg-white relative overflow-hidden" ref={containerRef}>
      <div className="container mx-auto px-4 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-4xl font-bold text-[var(--color-brand-maroon)] mb-4 font-[family-name:var(--font-heading)]"
          >
            Journey of Madhavji
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base text-[var(--color-brand-gray)]"
          >
            A timeline of dedication, resilience, and evolving family legacy.
          </motion.p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Animated Center Line (Desktop) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[var(--color-brand-cream-dark)] -translate-x-1/2">
            <motion.div 
              className="absolute top-0 left-0 w-full bg-[var(--color-brand-gold)] origin-top"
              style={{ height: lineHeight }}
            />
          </div>

          <div className="space-y-12 md:space-y-16">
            {timelineData.map((milestone, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div 
                  key={milestone.year}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`relative flex items-center gap-4 md:gap-16 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 w-4 h-4 rounded-full bg-[var(--color-brand-gold)] border-4 border-white shadow-md z-10 -translate-x-1/2" />

                  {/* Content Card */}
                  <div className={`w-1/2 ${isEven ? 'pr-4 md:pr-12 text-right' : 'pl-4 md:pl-12 text-left'}`}>
                    <div className={`p-4 md:p-8 rounded-2xl ${milestone.isHighlighted ? 'bg-[var(--color-brand-cream)] border border-[var(--color-brand-gold)]/30 shadow-[var(--shadow-elevated)]' : 'bg-white shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]'} transition-shadow duration-300 relative overflow-hidden group`}>
                      
                      {milestone.isHighlighted && (
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-gold)]/5 to-transparent pointer-events-none" />
                      )}

                      <span className="inline-block text-xl md:text-3xl font-bold text-[var(--color-brand-gold)] mb-1 md:mb-2 font-[family-name:var(--font-heading)]">
                        {milestone.year}
                      </span>
                      <h3 className="text-base md:text-xl font-bold text-[var(--color-brand-maroon)] mb-2 md:mb-3 font-[family-name:var(--font-heading)]">
                        {milestone.title}
                      </h3>
                      <div className="text-xs md:text-base text-[var(--color-brand-dark-light)] whitespace-pre-wrap leading-relaxed relative z-10">
                        {milestone.content}
                      </div>
                    </div>
                  </div>

                  {/* Image Card */}
                  <div className={`w-1/2 ${isEven ? 'pl-4 md:pl-12' : 'pr-4 md:pr-12'}`}>
                    <div className="relative h-40 md:h-72 w-full rounded-2xl overflow-hidden shadow-lg group">
                      <Image 
                        src={milestone.image}
                        alt={milestone.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
