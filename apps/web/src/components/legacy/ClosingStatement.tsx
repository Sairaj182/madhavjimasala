'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ClosingStatement() {
  return (
    <section className="relative py-24 lg:py-32 bg-brand-cream overflow-hidden flex items-center justify-center noise-overlay">
      {/* Decorative large watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none z-0">
        <svg className="h-[500px] w-[500px] text-brand-maroon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white p-10 md:p-16 rounded-3xl shadow-card border-t border-brand-gold/30 relative"
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-4 left-4 h-8 w-8 border-t border-l border-brand-gold/40" />
          <div className="absolute top-4 right-4 h-8 w-8 border-t border-r border-brand-gold/40" />
          <div className="absolute bottom-4 left-4 h-8 w-8 border-b border-l border-brand-gold/40" />
          <div className="absolute bottom-4 right-4 h-8 w-8 border-b border-r border-brand-gold/40" />

          <div className="mx-auto w-16 h-px bg-gradient-to-r from-transparent via-brand-gold to-transparent mb-8" />
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading leading-tight mb-8">
            The Story <span className="text-brand-maroon">Continues</span>
          </h2>
          
          <p className="text-lg md:text-2xl text-brand-gray font-heading italic leading-relaxed mb-12">
            "Every packet of Madhavji Masala carries nearly a century of dedication, craftsmanship and trust. Our journey began with one family's dream and continues through every kitchen we serve."
          </p>

          <Link
            href="/products"
            className="group inline-flex items-center gap-3 rounded-full bg-brand-maroon px-10 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-brand-maroon-dark hover:shadow-[0_8px_30px_rgba(139,26,26,0.35)] hover:-translate-y-1"
          >
            Explore Our Legacy Products
            <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

        </motion.div>
      </div>
    </section>
  );
}
