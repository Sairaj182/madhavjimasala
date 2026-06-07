'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function ClosingStatement() {
  return (
    <section className="relative py-20 bg-[var(--color-brand-cream-dark)] overflow-hidden flex items-center justify-center">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Image 
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop"
          alt="Spice background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-cream-dark)] via-transparent to-[var(--color-brand-cream-dark)]" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center max-w-4xl">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-[var(--shadow-elevated)] border border-white/50"
        >
          <div className="mx-auto w-12 h-1 bg-[var(--color-brand-gold)] mb-6" />
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-brand-maroon)] mb-6 font-[family-name:var(--font-heading)] leading-tight">
            The Story Continues
          </h2>
          
          <p className="text-lg md:text-xl text-[var(--color-brand-dark-light)] font-[family-name:var(--font-heading)] italic leading-relaxed mb-10">
            "Every packet of Madhavji Masala carries nearly a century of dedication, craftsmanship and trust. Our journey began with one family's dream and continues through every kitchen we serve."
          </p>

          <Link href="/products" className="inline-block group relative">
            <div className="absolute inset-0 bg-[var(--color-brand-gold)] blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300 rounded-full" />
            <button className="relative px-8 py-4 bg-[var(--color-brand-maroon)] text-white font-semibold tracking-wide rounded-full shadow-lg group-hover:bg-[var(--color-brand-maroon-dark)] group-hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Explore Our Products
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
              <div className="absolute inset-0 h-full w-full bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
            </button>
          </Link>

        </motion.div>
        
      </div>
    </section>
  );
}
