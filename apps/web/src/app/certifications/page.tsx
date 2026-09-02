import Link from "next/link";
import type { Metadata } from "next";
import { CERTIFICATIONS, PAGE_META } from "@/lib/constants";
import SectionDivider from "@/components/shared/SectionDivider";

export const metadata: Metadata = {
  title: PAGE_META.certifications.title,
  description: PAGE_META.certifications.description,
};

const FLOATING_PARTICLES = [
  { size: 4, top: "15%", right: "20%", delay: 0.2, duration: 5.5 },
  { size: 3, top: "60%", right: "10%", delay: 1.0, duration: 4.8 },
  { size: 5, top: "35%", left: "15%", delay: 0.8, duration: 6 },
  { size: 2, top: "80%", left: "25%", delay: 1.5, duration: 5 },
];

export default function CertificationsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-cream py-16 lg:py-24 noise-overlay">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="section-eyebrow">Quality Assurance</span>
            <h1 className="mt-4 font-heading text-4xl font-bold text-brand-dark sm:text-5xl lg:text-6xl">
              Certifications &{" "}
              <span className="block text-brand-maroon mt-2">Standards</span>
            </h1>
            <p className="mt-6 text-base leading-relaxed text-brand-gray">
              Every Madhavji Masala product is backed by rigorous certifications
              and quality standards. Our commitment to purity isn&apos;t just a
              claim — it&apos;s verified, tested, and certified.
            </p>
          </div>
        </div>
      </section>

      {/* Certifications Grid */}
      <section className="py-16 lg:py-24 noise-overlay">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {CERTIFICATIONS.map((cert) => (
              <div
                key={cert.id}
                className="gold-accent-left group rounded-2xl border border-transparent bg-white p-8 transition-all duration-300 hover:shadow-gold-glow hover:-translate-y-1 hover:border-brand-gold/20"
              >
                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-maroon/5 text-brand-maroon transition-all duration-300 group-hover:bg-brand-maroon group-hover:text-white group-hover:shadow-[0_4px_16px_rgba(139,26,26,0.25)]">
                  <CertIcon name={cert.icon} />
                </div>

                <h3 className="mt-6 font-heading text-xl font-bold text-brand-dark group-hover:text-brand-maroon transition-colors">
                  {cert.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-brand-gray">
                  {cert.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider variant="diamond" />

      {/* Quality Process */}
      <section className="relative bg-brand-dark py-20 lg:py-28 overflow-hidden">
        {/* Subtle warm gradient wash */}
        <div
          className="absolute inset-0 opacity-15 z-0"
          style={{
            background: "radial-gradient(circle at 70% 30%, rgba(139,26,26,0.3) 0%, transparent 60%)",
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
            <span className="section-eyebrow !text-brand-gold/70">24-Layer Protocol</span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Our Quality <span className="text-brand-gold">Testing Process</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/60">
              Every batch of Madhavji Masala undergoes a comprehensive 24-layer
              quality testing protocol before reaching your kitchen.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
             {/* Desktop Connector Line */}
             <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-px border-t border-dashed border-brand-gold/30 z-0" />

            {[
              {
                step: "01",
                title: "Raw Material Inspection",
                desc: "Visual, olfactory, and moisture-level checks on incoming raw spices.",
              },
              {
                step: "02",
                title: "Lab Analysis",
                desc: "HPLC testing for active compounds, heavy metals, and pesticide residues.",
              },
              {
                step: "03",
                title: "Microbial Testing",
                desc: "Complete microbiology panel — TPC, yeast, mold, E.coli, Salmonella.",
              },
              {
                step: "04",
                title: "Final Certification",
                desc: "Third-party lab verification and batch-level certificate of analysis.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative group rounded-2xl border border-brand-gold/20 bg-white/5 backdrop-blur-sm p-8 transition-all duration-300 hover:border-brand-gold hover:bg-white/10 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(212,160,23,0.15)] z-10"
              >
                <div className="inline-block rounded-full bg-brand-gold/10 px-4 py-1.5 mb-4 border border-brand-gold/30">
                  <span className="text-2xl font-bold font-heading text-brand-gold drop-shadow-sm">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-brand-gold-light transition-colors">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60 group-hover:text-white/80 transition-colors">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-maroon px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-maroon-dark hover:shadow-[0_8px_30px_rgba(139,26,26,0.35)] hover:-translate-y-0.5"
            >
              Request Certificate of Analysis
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function CertIcon({ name }: { name: string }) {
  const cls = "h-7 w-7";
  switch (name) {
    case "shield":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      );
    case "award":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.016 6.016 0 01-4.27 1.772 6.016 6.016 0 01-4.27-1.772" />
        </svg>
      );
    case "check-circle":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "settings":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "globe":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      );
    case "beaker":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      );
    default:
      return null;
  }
}
