'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { timelineData } from '@/lib/data/legacy';

const FLOATING_PARTICLES = [
  { size: 4, top: "20%", right: "15%", delay: 0.2, duration: 5.5 },
  { size: 3, top: "60%", right: "10%", delay: 1.0, duration: 4.8 },
  { size: 5, top: "35%", left: "15%", delay: 0.8, duration: 6 },
  { size: 2, top: "75%", left: "25%", delay: 1.5, duration: 5 },
  { size: 3, top: "90%", right: "45%", delay: 0.5, duration: 5 },
];

export default function JourneyTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center']
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section className="py-20 lg:py-28 bg-brand-dark relative overflow-hidden" ref={containerRef}>
      {/* Subtle warm gradient wash */}
      <div
        className="absolute inset-0 opacity-15 z-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(139,26,26,0.3) 0%, transparent 70%)",
        }}
      />

      {/* Floating particles */}
      {FLOATING_PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none z-0"
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            right: p.right,
            left: p.left,
            background: `radial-gradient(circle, rgba(212,160,23,0.6), rgba(212,160,23,0.1))`,
            animation: `gentle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mb-4"
          >
            <span className="section-eyebrow !text-brand-gold/70">A Century of Flavor</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl lg:text-4xl font-bold text-white mb-4 font-heading"
          >
            Journey of <span className="text-brand-gold">Madhavji Masala</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base text-white/70"
          >
            A timeline of dedication, resilience, and evolving family legacy.
          </motion.p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Animated Center Line (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-brand-gold/20 -translate-x-1/2">
            <motion.div 
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-brand-gold-light via-brand-gold to-brand-gold/10 origin-top shadow-[0_0_10px_rgba(212,160,23,0.8)]"
              style={{ height: lineHeight }}
            />
          </div>
          {/* Mobile line */}
          <div className="md:hidden absolute left-4 top-0 bottom-0 w-px bg-brand-gold/20">
             <motion.div 
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-brand-gold-light via-brand-gold to-brand-gold/10 origin-top shadow-[0_0_10px_rgba(212,160,23,0.8)]"
              style={{ height: lineHeight }}
            />
          </div>

          <div className="space-y-12 md:space-y-24">
            {timelineData.map((milestone, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div 
                  key={milestone.year}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-16 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  
                  {/* Timeline Dot (Desktop) */}
                  <div className="hidden md:block absolute left-1/2 w-4 h-4 rounded-full bg-brand-gold border-4 border-brand-dark shadow-[0_0_15px_rgba(212,160,23,0.5)] z-10 -translate-x-1/2 transition-transform duration-300 hover:scale-150" />
                  
                  {/* Timeline Dot (Mobile) */}
                  <div className="md:hidden absolute left-[14px] top-6 w-3 h-3 rounded-full bg-brand-gold border-[3px] border-brand-dark shadow-[0_0_10px_rgba(212,160,23,0.5)] z-10" />

                  {/* Content Card */}
                  <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                    <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-brand-gold/10 transition-all duration-300 hover:border-brand-gold/40 hover:bg-white/10 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(212,160,23,0.15)] relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      <div className="inline-block rounded-full bg-brand-gold/10 px-4 py-1.5 mb-4 border border-brand-gold/20">
                        <span className="inline-block text-xl md:text-3xl font-bold text-brand-gold font-heading drop-shadow-sm">
                          {milestone.year}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-3 font-heading group-hover:text-brand-gold-light transition-colors">
                        {milestone.title}
                      </h3>
                      <div className="text-sm md:text-base text-white/70 whitespace-pre-wrap leading-relaxed relative z-10">
                        {milestone.content}
                      </div>
                    </div>
                  </div>

                  {/* Image Card */}
                  <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${isEven ? 'md:pl-12' : 'md:pr-12'}`}>
                    <div className="relative h-48 md:h-72 w-full rounded-2xl overflow-hidden shadow-elevated group">
                      <Image 
                        src={milestone.image}
                        alt={milestone.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                      <div className="absolute inset-0 ring-1 ring-inset ring-brand-gold/20 rounded-2xl pointer-events-none" />
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
