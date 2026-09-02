import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ABOUT_CONTENT, PROCESS_STEPS, PAGE_META, SITE_INFO } from "@/lib/constants";
import SectionDivider from "@/components/shared/SectionDivider";

export const metadata: Metadata = {
  title: PAGE_META.about.title,
  description: PAGE_META.about.description,
};

const FLOATING_PARTICLES = [
  { size: 3, top: "10%", right: "15%", delay: 0, duration: 5 },
  { size: 5, top: "50%", right: "25%", delay: 1.5, duration: 6 },
  { size: 2, top: "30%", right: "10%", delay: 0.8, duration: 4.5 },
  { size: 4, top: "80%", right: "35%", delay: 2, duration: 5.5 },
  { size: 3, top: "20%", left: "15%", delay: 0.5, duration: 4.8 },
  { size: 2, top: "70%", left: "20%", delay: 1.2, duration: 5 },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 lg:py-24 noise-overlay">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Content */}
            <div>
              <span className="section-eyebrow">Our Heritage</span>
              <h1 className="mt-4 font-heading text-4xl font-bold text-brand-dark sm:text-5xl lg:text-6xl">
                {ABOUT_CONTENT.heritage.headline}{" "}
                <span className="block text-brand-maroon">
                  {ABOUT_CONTENT.heritage.highlightedText}
                </span>
              </h1>

              <div className="mt-8 space-y-4">
                {ABOUT_CONTENT.heritage.story.map((paragraph, i) => (
                  <p key={i} className="text-base leading-relaxed text-brand-gray border-l-2 border-brand-gold/30 pl-4">
                    {paragraph}
                  </p>
                ))}
              </div>

              <Link
                href="/products"
                className="mt-8 group inline-flex items-center gap-2 rounded-full border border-brand-maroon/30 px-7 py-3.5 text-sm font-semibold text-brand-maroon transition-all duration-300 hover:bg-brand-maroon hover:text-white hover:border-brand-maroon hover:shadow-[0_8px_30px_rgba(139,26,26,0.3)]"
              >
                Explore Our Products
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Heritage Image with Vintage Frame */}
            <div className="relative aspect-[4/3] w-full max-w-lg mx-auto">
              <div className="absolute -inset-3 border border-brand-gold/20 rounded-2xl pointer-events-none" />
              <div className="absolute -inset-1.5 border border-brand-gold/10 rounded-2xl pointer-events-none" />
              <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-elevated">
                <Image
                  src={ABOUT_CONTENT.heritage.image}
                  alt="Madhavji Masala heritage"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-maroon-dark/40 via-transparent to-transparent" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
              </div>
              <div className="absolute -top-4 -right-4 h-3 w-3 rounded-full bg-brand-gold/40 animate-[gentle-float_4s_ease-in-out_infinite]" />
              <div className="absolute -bottom-3 -left-3 h-2 w-2 rounded-full bg-brand-gold/30 animate-[gentle-float_5s_ease-in-out_1s_infinite]" />
            </div>
          </div>
        </div>
      </section>

      <SectionDivider variant="diamond" />

      {/* Vision & Mission */}
      <section className="bg-brand-cream py-16 lg:py-24 noise-overlay">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Vision */}
            <div className="gold-accent-left rounded-2xl bg-white p-8 shadow-card lg:p-10 transition-all duration-300 hover:shadow-gold-glow">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-maroon/5 text-brand-maroon shadow-sm">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="mt-6 font-heading text-3xl font-bold text-brand-maroon">
                {ABOUT_CONTENT.vision.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-brand-gray">
                {ABOUT_CONTENT.vision.description}
              </p>
              <div className="mt-6 space-y-3 pt-6 border-t border-brand-border/50">
                {ABOUT_CONTENT.vision.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-3 text-sm">
                    <svg className="h-4 w-4 text-brand-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-brand-dark font-medium">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission */}
            <div className="relative overflow-hidden rounded-2xl bg-brand-maroon p-8 text-white lg:p-10 shadow-[0_8px_30px_rgba(139,26,26,0.3)] transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-maroon-light/20 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-brand-gold shadow-inner backdrop-blur-sm">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                </div>
                <h2 className="mt-6 font-heading text-3xl font-bold">
                  {ABOUT_CONTENT.mission.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/80">
                  {ABOUT_CONTENT.mission.description}
                </p>
                <div className="mt-6 space-y-3 pt-6 border-t border-white/10">
                  {ABOUT_CONTENT.mission.highlights.map((h) => (
                    <div key={h} className="flex items-center gap-3 text-sm">
                      <svg className="h-4 w-4 text-brand-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="font-medium text-white/90">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider variant="line" />

      {/* Modern Apothecary — Process */}
      <section id="process" className="py-16 lg:py-24 noise-overlay">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <span className="section-eyebrow">Our Methodology</span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-brand-dark sm:text-4xl lg:text-5xl">
              {ABOUT_CONTENT.facility.headline}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-brand-gray">
              {ABOUT_CONTENT.facility.subtitle}
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:gap-8 md:grid-cols-3">
            {PROCESS_STEPS.map((step, i) => (
              <div
                key={step.id}
                className="animated-border-card group flex flex-col h-full bg-transparent overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover"
              >
                <div className="flex flex-col h-full relative z-10 rounded-[inherit] overflow-hidden bg-white">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                    
                    {/* Floating Step Badge */}
                    <div className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-sm font-bold text-white ring-2 ring-brand-gold/40 shadow-lg">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow p-6">
                    <h3 className="font-heading text-xl font-bold text-brand-dark transition-colors group-hover:text-brand-maroon">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-brand-gray">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legacy Timeline */}
      <section className="relative bg-brand-dark py-20 lg:py-28 overflow-hidden">
        {/* Subtle warm gradient wash */}
        <div
          className="absolute inset-0 opacity-15 z-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(139,26,26,0.3) 0%, transparent 60%)",
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

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <span className="section-eyebrow !text-brand-gold/70">A Century of Flavor</span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Our Journey <span className="text-brand-gold">Through Time</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
            {/* Desktop Connector Line */}
            <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-px border-t border-dashed border-brand-gold/30 z-0" />

            {[
              { year: SITE_INFO.foundedYear.toString(), event: "Founded", desc: "Started as a small grinding mill in Unjha, Gujarat." },
              { year: "1995", event: "First Export", desc: "Expanded to international markets with first bulk shipment." },
              { year: "2010", event: "Modern Facility", desc: "Opened state-of-the-art processing facility with cryogenic grinding." },
              { year: "2026", event: "Digital Presence", desc: "Launched digital platform to serve customers." },
            ].map((milestone) => (
              <div
                key={milestone.year}
                className="relative group rounded-2xl border border-brand-gold/20 bg-white/5 backdrop-blur-sm p-8 transition-all duration-300 hover:border-brand-gold hover:bg-white/10 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(212,160,23,0.15)] z-10"
              >
                {/* Year Badge */}
                <div className="inline-block rounded-full bg-brand-gold/10 px-4 py-1.5 mb-4 border border-brand-gold/30">
                  <p className="text-2xl font-bold font-heading text-brand-gold drop-shadow-sm">
                    {milestone.year}
                  </p>
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {milestone.event}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {milestone.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
