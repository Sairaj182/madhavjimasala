'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { currentLeadershipData } from '@/lib/data/legacy';

export default function CurrentLeadership() {
  return (
    <section className="py-20 lg:py-28 bg-brand-cream relative noise-overlay">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mb-4"
          >
            <span className="section-eyebrow">The Next Generation</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl lg:text-4xl font-bold text-brand-dark mb-4 font-heading"
          >
            Leading the <span className="text-brand-maroon">Legacy Forward</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base text-brand-gray"
          >
            The visionaries carrying the Madhavji name into a new era of growth and innovation.
          </motion.p>
        </div>

        {/* Leadership Grid */}
        <div className="flex flex-col md:flex-row justify-center gap-10 lg:gap-24">
          {currentLeadershipData.map((leader, index) => (
            <motion.div 
              key={leader.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center group max-w-sm w-full mx-auto md:mx-0"
            >
              <div className="relative mb-8 p-2">
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-full bg-brand-maroon/20 blur-3xl transition-all duration-700 group-hover:bg-brand-maroon/40" />
                <div className="absolute inset-0 rounded-full bg-brand-gold/20 blur-2xl transition-all duration-700 scale-75 group-hover:scale-110 opacity-0 group-hover:opacity-100" />
                
                {/* Portrait */}
                <div className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-full overflow-hidden border-2 border-brand-gold/30 shadow-card group-hover:border-brand-gold group-hover:shadow-[0_0_30px_rgba(212,160,23,0.3)] transition-all duration-500 z-10 bg-white p-2">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image 
                      src={leader.image}
                      alt={leader.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="text-center p-6 bg-white rounded-2xl shadow-card w-full border border-transparent group-hover:border-brand-gold/30 transition-all duration-500 transform group-hover:-translate-y-2 group-hover:shadow-card-hover relative">
                {/* Accent bar */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-brand-maroon via-brand-gold to-brand-maroon rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <h3 className="text-xl font-bold text-brand-dark group-hover:text-brand-maroon transition-colors mb-2 font-heading">
                  {leader.name}
                </h3>
                <div className="h-px w-12 bg-brand-gold/50 mx-auto mb-3" />
                <p className="text-brand-gray uppercase tracking-widest text-[10px] md:text-xs font-bold">
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
