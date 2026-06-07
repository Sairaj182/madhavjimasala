import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ABOUT_CONTENT, PROCESS_STEPS, PAGE_META, SITE_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: PAGE_META.about.title,
  description: PAGE_META.about.description,
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Content */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-maroon">
                Our Heritage
              </p>
              <h1 className="mt-4 font-heading text-4xl font-bold text-brand-dark sm:text-5xl lg:text-6xl">
                {ABOUT_CONTENT.heritage.headline}{" "}
                <span className="block text-brand-maroon">
                  {ABOUT_CONTENT.heritage.highlightedText}
                </span>
              </h1>

              <div className="mt-8 space-y-4">
                {ABOUT_CONTENT.heritage.story.map((paragraph, i) => (
                  <p key={i} className="text-base leading-relaxed text-brand-gray">
                    {paragraph}
                  </p>
                ))}
              </div>

              <Link
                href="/products"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-maroon transition-colors hover:text-brand-maroon-dark"
              >
                Explore Our Products
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Heritage Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={ABOUT_CONTENT.heritage.image}
                alt="Madhavji Masala heritage"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-brand-cream py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Vision */}
            <div className="rounded-2xl bg-white p-8 shadow-card lg:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-cream text-brand-maroon">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="mt-6 font-heading text-2xl font-bold text-brand-maroon">
                {ABOUT_CONTENT.vision.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-brand-gray">
                {ABOUT_CONTENT.vision.description}
              </p>
              <div className="mt-6 space-y-2">
                {ABOUT_CONTENT.vision.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-2 text-sm">
                    <svg className="h-4 w-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-brand-dark font-medium">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission */}
            <div className="rounded-2xl bg-brand-maroon p-8 text-white lg:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </div>
              <h2 className="mt-6 font-heading text-2xl font-bold">
                {ABOUT_CONTENT.mission.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/80">
                {ABOUT_CONTENT.mission.description}
              </p>
              <div className="mt-6 space-y-2">
                {ABOUT_CONTENT.mission.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-2 text-sm">
                    <svg className="h-4 w-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="font-medium">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Apothecary — Process */}
      <section id="process" className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-brand-dark sm:text-4xl">
              {ABOUT_CONTENT.facility.headline}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-brand-gray">
              {ABOUT_CONTENT.facility.subtitle}
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.id}
                className="group overflow-hidden rounded-2xl bg-brand-cream transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-xs font-bold text-brand-gold">
                    {step.number}
                  </p>
                  <h3 className="mt-2 font-heading text-xl font-bold text-brand-dark">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-brand-gray">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legacy Timeline */}
      <section className="bg-brand-dark py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Our Journey Through Time
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { year: SITE_INFO.foundedYear.toString(), event: "Founded", desc: "Started as a small grinding mill in Unjha, Gujarat." },
              { year: "1995", event: "First Export", desc: "Expanded to international markets with first bulk shipment." },
              { year: "2010", event: "Modern Facility", desc: "Opened state-of-the-art processing facility with cryogenic grinding." },
              { year: "2026", event: "Digital Presence", desc: "Launched digital platform to serve customers." },
            ].map((milestone) => (
              <div
                key={milestone.year}
                className="group rounded-2xl border border-white/10 p-6 transition-all duration-300 hover:border-brand-gold/30 hover:bg-white/5"
              >
                <p className="text-3xl font-bold font-heading text-brand-gold">
                  {milestone.year}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {milestone.event}
                </h3>
                <p className="mt-2 text-sm text-white/50">
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
