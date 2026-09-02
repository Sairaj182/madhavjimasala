'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { countersData } from '@/lib/data/legacy';

const FLOATING_PARTICLES = [
  { size: 4, top: "20%", right: "15%", delay: 0.2, duration: 5.5 },
  { size: 3, top: "60%", right: "10%", delay: 1.0, duration: 4.8 },
  { size: 5, top: "35%", left: "15%", delay: 0.8, duration: 6 },
  { size: 2, top: "75%", left: "25%", delay: 1.5, duration: 5 },
];

function CounterItem({ label, value, suffix }: { label: string, value: number, suffix: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView && nodeRef.current) {
      const controls = animate(0, value, {
        duration: 2.5,
        ease: 'easeOut',
        onUpdate: (val: number) => {
          setDisplayValue(Math.floor(val));
        },
      });

      return () => controls.stop();
    }
  }, [isInView, value]);

  return (
    <div className="flex flex-col items-center p-8 group relative">
      {/* Hover Glow Background */}
      <div className="absolute inset-0 bg-brand-gold/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="text-4xl lg:text-6xl font-bold font-heading mb-4 relative flex items-baseline">
        <span className="text-brand-gold drop-shadow-md">
          <span ref={nodeRef}>{displayValue}</span>
          <span>{suffix}</span>
        </span>
      </div>
      <p className="text-white/80 text-sm md:text-base uppercase tracking-[0.2em] font-semibold group-hover:text-white transition-colors duration-300 relative z-10 text-center">
        {label}
      </p>
    </div>
  );
}

export default function LegacyCounters() {
  return (
    <section className="py-20 lg:py-28 bg-brand-maroon relative overflow-hidden noise-overlay">
      
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
            background: `radial-gradient(circle, rgba(212,160,23,0.5), rgba(212,160,23,0.1))`,
            animation: `gentle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-brand-gold/20 bg-white/5 backdrop-blur-sm rounded-3xl border border-brand-gold/10 p-4 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
          {countersData.map((counter, index) => (
            <motion.div
              key={counter.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="relative"
            >
              <CounterItem 
                label={counter.label} 
                value={counter.value} 
                suffix={counter.suffix} 
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
