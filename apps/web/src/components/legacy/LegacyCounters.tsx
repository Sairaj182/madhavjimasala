'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { countersData } from '@/lib/data/legacy';

function CounterItem({ label, value, suffix }: { label: string, value: number, suffix: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView && nodeRef.current) {
      const controls = animate(0, value, {
        duration: 2,
        ease: 'easeOut',
        onUpdate: (val: number) => {
          setDisplayValue(Math.floor(val));
        },
      });

      return () => controls.stop();
    }
  }, [isInView, value]);

  return (
    <div className="flex flex-col items-center p-6 group">
      <div className="text-4xl lg:text-5xl font-bold text-[var(--color-brand-gold)] mb-3 font-[family-name:var(--font-heading)] relative flex items-baseline">
        <span ref={nodeRef}>{displayValue}</span>
        <span>{suffix}</span>
      </div>
      <p className="text-[var(--color-brand-cream)] text-base uppercase tracking-wider font-semibold opacity-90 group-hover:text-white transition-colors duration-300">
        {label}
      </p>
    </div>
  );
}

export default function LegacyCounters() {
  return (
    <section className="py-16 bg-[var(--color-brand-maroon)] relative overflow-hidden">
      {/* Background Subtle Shimmer/Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-[var(--color-brand-gold)]/20">
          {countersData.map((counter, index) => (
            <motion.div
              key={counter.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
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
