import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { currentLeadershipData, timelineData, valuesData } from '@/lib/data/legacy';

export const metadata: Metadata = {
  title: 'Our Legacy | Madhavji Masala',
  description: 'From Bagasra to Vadodara. Discover the family, the milestones, and the values behind Madhavji Masala since 1930.',
};

const eyebrow = 'text-[11px] font-bold uppercase tracking-[0.22em]';

export default function LegacyPage() {
  return (
    <div className="bg-brand-cream text-brand-dark">
      <section className="mx-auto max-w-7xl px-5 pb-12 pt-16 sm:px-8 lg:px-12 lg:pb-20 lg:pt-24">
        <div className="flex items-center justify-between gap-4 border-b border-brand-maroon/20 pb-5">
          <p className={`${eyebrow} text-brand-maroon`}>The Madhavji story</p>
          <span className="text-xs text-brand-gray">Bagasra · Vadodara</span>
        </div>
        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className={`${eyebrow} text-brand-maroon`}>Rooted in family. Since 1930.</p>
            <h1 className="mt-5 font-heading text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl xl:text-7xl">A name passed down.<br /><span className="font-normal italic text-brand-maroon">A promise kept.</span></h1>
            <p className="mt-7 max-w-lg text-base leading-8 text-brand-gray">Before it was a name on a packet, Madhavji was a family enterprise. Its story began with honest trade, grew through generations, and found a home in the kitchens we serve.</p>
            <Link href="#journey" className="mt-8 inline-flex items-center gap-5 border-b border-brand-maroon pb-2 text-sm font-bold text-brand-maroon transition hover:text-brand-maroon-dark">Follow our story <span aria-hidden="true">↓</span></Link>
          </div>
          <figure className="relative mx-auto w-full max-w-md">
            <div className="absolute -left-3 bottom-12 top-5 w-full border border-brand-gold/50 sm:-left-5" aria-hidden="true" />
            <div className="relative aspect-square overflow-hidden rounded-t-[45%] bg-white">
              <Image src="/images/about/legacy/MadhavjiNanji.png" alt="Portrait illustration of founder Madhavji Nanji Raithatha" fill priority sizes="(max-width: 1024px) 90vw, 420px" className="object-contain" />
            </div>
            <figcaption className="relative border-t border-brand-maroon/20 bg-brand-cream px-3 pb-2 pt-5">
              <p className="font-heading text-xl font-bold">Madhavji Nanji Raithatha</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-brand-gray">Founder · Madhavji Nanji &amp; Sons</p>
            </figcaption>
          </figure>
        </div>
      </section>

      <nav aria-label="Explore our legacy" className="border-y border-brand-maroon/15 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-brand-maroon/10 px-5 sm:grid-cols-4 sm:px-8 lg:px-12">
          {[["01", "The journey", "journey"], ["02", "The family", "family"], ["03", "Our values", "values"], ["04", "The next chapter", "next-chapter"]].map(([number, label, anchor]) => <Link key={anchor} href={`#${anchor}`} className="flex items-center gap-3 px-3 py-5 text-xs font-semibold transition hover:bg-brand-cream hover:text-brand-maroon sm:py-6"><span className="font-heading text-lg text-brand-maroon/60">{number}</span>{label}</Link>)}
        </div>
      </nav>

      <section id="journey" className="mx-auto max-w-7xl scroll-mt-32 px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mb-12 grid gap-5 md:grid-cols-2 md:items-end">
          <div><p className={`${eyebrow} text-brand-maroon`}>01 / The journey</p><h2 className="mt-4 font-heading text-4xl font-bold sm:text-5xl">Small beginnings.<br /><span className="font-normal italic">Lasting roots.</span></h2></div>
          <p className="max-w-md text-sm leading-7 text-brand-gray md:justify-self-end">Every chapter brought a new place, a new responsibility, and the same commitment to quality. These are the moments that shaped the Madhavji name.</p>
        </div>
        <div>
          {timelineData.map((milestone, index) => <article key={milestone.year} className="grid gap-6 border-t border-brand-maroon/20 py-9 sm:grid-cols-[6rem_minmax(0,1fr)] lg:grid-cols-[8rem_minmax(0,1fr)_18rem] lg:gap-10 lg:py-12">
            <div><p className="font-heading text-4xl text-brand-maroon sm:text-5xl">{milestone.year}</p><p className="mt-2 text-[10px] uppercase tracking-widest text-brand-gray">Chapter {String(index + 1).padStart(2, '0')}</p></div>
            <div className="min-w-0"><h3 className="font-heading text-2xl font-bold sm:text-3xl">{milestone.title}</h3><p className="mt-4 max-w-xl whitespace-pre-line text-sm leading-7 text-brand-gray">{milestone.content}</p>{milestone.isHighlighted && <span className="mt-5 inline-block border-l-2 border-brand-gold pl-3 text-xs font-bold uppercase tracking-widest text-brand-maroon">From trading to spice manufacturing</span>}</div>
            <figure className="relative aspect-[4/3] w-full overflow-hidden bg-white sm:col-start-2 lg:col-start-auto"><Image src={milestone.image} alt={milestone.title} fill sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 288px" className="object-contain p-3" /></figure>
          </article>)}
        </div>
      </section>

      <section id="family" className="scroll-mt-32 bg-brand-maroon-dark text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-12 lg:py-24">
          <div><p className={`${eyebrow} text-brand-gold-light`}>02 / The family</p><h2 className="mt-5 font-heading text-4xl font-bold leading-tight sm:text-5xl">The people behind<br /><span className="font-normal italic text-brand-gold-light">the promise.</span></h2><p className="mt-6 max-w-md text-sm leading-7 text-white/80">In 1992, brothers Mitul and Suhag Raithatha established the Madhavji Masala manufacturing unit. Today, they continue to carry the family name forward.</p><div className="mt-8 h-px w-16 bg-brand-gold" /></div>
          <div className="grid grid-cols-2 gap-3 sm:gap-8">{currentLeadershipData.map((leader) => <figure key={leader.name} className="min-w-0"><div className="relative aspect-[4/5] overflow-hidden bg-brand-cream"><Image src={leader.image} alt={leader.name} fill sizes="(max-width: 640px) 46vw, (max-width: 1024px) 45vw, 320px" className="object-contain object-bottom" /></div><figcaption className="border-b border-white/20 pb-4 pt-3 sm:pb-5 sm:pt-5"><p className="break-words font-heading text-sm font-bold leading-tight sm:text-xl">{leader.name}</p><p className="mt-2 text-[9px] uppercase tracking-widest text-brand-gold-light sm:text-xs">{leader.role}</p></figcaption></figure>)}</div>
        </div>
      </section>

      <section id="values" className="mx-auto max-w-7xl scroll-mt-32 px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="max-w-2xl"><p className={`${eyebrow} text-brand-maroon`}>03 / What stays with us</p><h2 className="mt-4 font-heading text-4xl font-bold sm:text-5xl">Time moves forward.<br /><span className="font-normal italic text-brand-maroon">Our values stay rooted.</span></h2></div>
        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">{valuesData.map((value, index) => <article key={value.title} className="border-t border-brand-gold/50 pt-6"><span className="font-heading text-3xl text-brand-maroon/50">0{index + 1}</span><h3 className="mt-4 font-heading text-xl font-bold">{value.title}</h3><p className="mt-3 text-sm leading-7 text-brand-gray">{value.description}</p></article>)}</div>
      </section>

      <section id="next-chapter" className="scroll-mt-32 border-t border-brand-maroon/15 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-24">
          <div className="relative aspect-[4/3] overflow-hidden"><Image src="/images/hero/hero-banner.png" alt="Spices from the Madhavji Masala collection" fill sizes="(max-width: 1024px) 90vw, 560px" className="object-cover" /></div>
          <div><p className={`${eyebrow} text-brand-maroon`}>04 / The story continues</p><h2 className="mt-5 font-heading text-4xl font-bold leading-tight sm:text-5xl">From our family,<br /><span className="font-normal italic text-brand-maroon">to your kitchen.</span></h2><p className="mt-6 text-base leading-8 text-brand-gray">Every packet carries the care, craftsmanship, and trust that shaped our beginnings. Discover the flavours that keep this story alive.</p><Link href="/products" className="mt-8 inline-flex items-center gap-5 rounded-full bg-brand-maroon px-7 py-3.5 text-sm font-bold text-white transition hover:bg-brand-maroon-dark">Explore our spices <span aria-hidden="true">→</span></Link></div>
        </div>
      </section>
    </div>
  );
}
