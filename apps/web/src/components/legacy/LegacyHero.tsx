'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface LegacyHeroProps {
  showCta?: boolean;
}

export default function LegacyHero({ showCta = false }: LegacyHeroProps) {
  return (
    <section className="relative overflow-hidden bg-brand-cream">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:min-h-[660px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-10 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative z-10">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-maroon"><span className="h-px w-9 bg-brand-gold" aria-hidden="true" /> Since 1930</p>
          {showCta ? (
            <h2 className="mt-6 max-w-2xl font-heading text-4xl font-bold leading-[1.12] text-brand-dark sm:text-5xl lg:text-6xl">
              A family story, <span className="text-brand-maroon">told through spice.</span>
            </h2>
          ) : (
            <h1 className="mt-6 max-w-2xl font-heading text-4xl font-bold leading-[1.12] text-brand-dark sm:text-5xl lg:text-6xl">
              A family story, <span className="text-brand-maroon">told through spice.</span>
            </h1>
          )}
          <p className="mt-6 max-w-xl text-base leading-8 text-brand-gray sm:text-lg">From Madhavji Nanji Raithatha’s first enterprise to the masala mill of today, each generation has carried forward a commitment to honest work and authentic flavour.</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href={showCta ? '/legacy' : '#journey'} className="inline-flex items-center gap-3 rounded-full bg-brand-maroon px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-maroon-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-maroon">
              {showCta ? 'Discover our legacy' : 'Explore our journey'} <span aria-hidden="true">→</span>
            </Link>
            {!showCta && <span className="text-sm font-medium text-brand-gray">Bagasra → Vadodara</span>}
          </div>
          <div className="mt-12 flex max-w-lg items-center gap-5 border-t border-brand-gold/30 pt-6">
            <span className="font-heading text-4xl font-bold text-brand-maroon">1930</span>
            <span className="text-sm leading-6 text-brand-gray">The beginning of Madhavji Nanji &amp; Sons, and a name built on trust.</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} className="relative mx-auto w-full max-w-xl pb-5 pl-5 sm:pb-7 sm:pl-7">
          <div className="absolute inset-x-0 bottom-0 top-7 rounded-[2rem] bg-brand-maroon sm:top-10" aria-hidden="true" />
          <div className="relative aspect-[4/4.3] overflow-hidden rounded-[1.5rem] border-4 border-white bg-brand-cream shadow-elevated sm:aspect-[4/4]">
            <Image src="/images/about/legacy/MadhavjiNanji.png" alt="Madhavji Nanji Raithatha, founder of the family enterprise" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover object-top" priority />
          </div>
          <div className="absolute bottom-0 right-0 max-w-[80%] rounded-tl-2xl bg-white px-5 py-4 shadow-card sm:px-7 sm:py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-maroon">The founder</p>
            <p className="mt-1 font-heading text-lg font-bold text-brand-dark sm:text-xl">Madhavji Nanji Raithatha</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
