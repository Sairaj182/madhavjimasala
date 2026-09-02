"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CONTACT_INFO, PAGE_META } from "@/lib/constants";
import SectionDivider from "@/components/shared/SectionDivider";

const FLOATING_PARTICLES = [
  { size: 3, top: "20%", right: "10%", delay: 0, duration: 5 },
  { size: 5, top: "60%", right: "25%", delay: 1.5, duration: 6 },
  { size: 2, top: "35%", left: "15%", delay: 0.8, duration: 4.5 },
  { size: 4, top: "75%", left: "30%", delay: 2, duration: 5.5 },
];

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormState({ name: "", email: "", message: "" });
  };

  return (
    <>
      {/* Hero */}
      <section className="py-16 lg:py-20 noise-overlay">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <span className="section-eyebrow">Contact Us</span>
            <h1 className="mt-4 font-heading text-4xl font-bold text-brand-dark sm:text-5xl lg:text-6xl">
              Let&apos;s Talk <span className="text-brand-maroon">Spices.</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-brand-gray border-l-2 border-brand-gold/30 pl-4">
              From wholesale inquiries to artisanal spice sourcing, our
              team is ready to curate the perfect flavor profile for your
              business.
            </p>
          </div>
        </div>
      </section>

      {/* Form + Contact Info */}
      <section className="pb-16 lg:pb-24 noise-overlay">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl border border-brand-gold/10 bg-white/80 backdrop-blur-md p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)] lg:p-10 relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-maroon/5 rounded-full blur-3xl pointer-events-none" />

                <h2 className="font-heading text-2xl font-bold text-brand-dark relative z-10">
                  Business Inquiry
                </h2>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6 relative z-10">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium text-brand-dark">
                        Full Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        placeholder="John Doe"
                        value={formState.name}
                        onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                        required
                        className="mt-2 w-full rounded-xl border border-brand-border bg-brand-cream/40 px-4 py-3 text-sm text-brand-dark placeholder-brand-gray-light outline-none transition-all focus:border-brand-maroon focus:ring-2 focus:ring-brand-maroon/10 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium text-brand-dark">
                        Work Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        placeholder="john@company.com"
                        value={formState.email}
                        onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                        required
                        className="mt-2 w-full rounded-xl border border-brand-border bg-brand-cream/40 px-4 py-3 text-sm text-brand-dark placeholder-brand-gray-light outline-none transition-all focus:border-brand-maroon focus:ring-2 focus:ring-brand-maroon/10 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-brand-dark">
                      Requirement Details
                    </label>
                    <textarea
                      id="contact-message"
                      placeholder="Tell us about your bulk needs or specific spice interests..."
                      rows={5}
                      value={formState.message}
                      onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
                      required
                      className="mt-2 w-full resize-none rounded-xl border border-brand-border bg-brand-cream/40 px-4 py-3 text-sm text-brand-dark placeholder-brand-gray-light outline-none transition-all focus:border-brand-maroon focus:ring-2 focus:ring-brand-maroon/10 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitted}
                    className={`w-full rounded-xl py-4 text-sm font-semibold text-white transition-all duration-300 ${
                      submitted
                        ? "bg-[#25D366] cursor-default shadow-[0_4px_20px_rgba(37,211,102,0.4)]"
                        : "bg-brand-maroon hover:bg-brand-maroon-dark hover:shadow-[0_8px_30px_rgba(139,26,26,0.35)] hover:-translate-y-0.5"
                    }`}
                  >
                    {submitted ? "✓ Inquiry Sent Successfully!" : "Send Inquiry"}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* WhatsApp Quick Support */}
              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] p-6 text-white transition-all duration-300 hover:shadow-[0_8px_30px_rgba(37,211,102,0.3)] hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm relative z-10">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-bold">Quick Support</p>
                  <p className="text-xs text-white/90">Chat with our export executive</p>
                </div>
                <svg className="ml-auto h-5 w-5 transition-transform group-hover:translate-x-1 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </a>

              {/* Corporate Office */}
              <div className="gold-accent-left rounded-2xl border border-transparent bg-white p-6 transition-all duration-300 hover:border-brand-gold/20 hover:shadow-gold-glow">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-cream text-brand-maroon shadow-sm">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-dark">
                      {CONTACT_INFO.corporateOffice.label}
                    </h3>
                    {CONTACT_INFO.corporateOffice.address.map((line, i) => (
                      <p key={i} className="text-sm text-brand-gray mt-1">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Production Facility */}
              <div className="gold-accent-left rounded-2xl border border-transparent bg-white p-6 transition-all duration-300 hover:border-brand-gold/20 hover:shadow-gold-glow">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-cream text-brand-maroon shadow-sm">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-dark">
                      {CONTACT_INFO.productionFacility.label}
                    </h3>
                    {CONTACT_INFO.productionFacility.address.map((line, i) => (
                      <p key={i} className="text-sm text-brand-gray mt-1">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="gold-accent-left rounded-2xl border border-transparent bg-white p-6 transition-all duration-300 hover:border-brand-gold/20 hover:shadow-gold-glow">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-cream text-brand-maroon shadow-sm">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-dark mb-1">
                      Call or Email
                    </h3>
                    {CONTACT_INFO.phones.map((phone, i) => (
                      <p key={`phone-${i}`} className="text-sm text-brand-gray">
                        <a href={`tel:${phone}`} className="hover:text-brand-maroon transition-colors">
                          {phone}
                        </a>
                      </p>
                    ))}
                    <div className="mt-2" />
                    {CONTACT_INFO.emails.map((email, i) => (
                      <p key={`email-${i}`} className="text-sm text-brand-gray">
                        <a href={`mailto:${email}`} className="hover:text-brand-maroon transition-colors">
                          {email}
                        </a>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider variant="leaf" />

      {/* Map Section */}
      <section className="relative bg-brand-cream py-16 lg:py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative overflow-hidden rounded-3xl bg-brand-dark shadow-elevated border border-brand-gold/10">
            {/* Subtle warm gradient wash */}
            <div
              className="absolute inset-0 opacity-15 z-0"
              style={{
                background: "radial-gradient(circle at 50% 50%, rgba(212,160,23,0.3) 0%, transparent 70%)",
              }}
            />

             {/* Floating particles */}
            {FLOATING_PARTICLES.map((p, i) => (
              <div
                key={`map-${i}`}
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

            {/* Map content */}
            <div className="relative z-10 flex items-center justify-center py-20 px-8">
              <div className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-maroon/20 text-brand-gold shadow-[0_0_30px_rgba(139,26,26,0.2)]">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-gold/10 px-4 py-2 text-xs font-bold text-brand-gold border border-brand-gold/30">
                  <span className="h-2 w-2 rounded-full bg-brand-gold animate-pulse" />
                  CERTIFIED ORIGIN
                </div>

                <h3 className="mt-4 font-heading text-3xl font-bold sm:text-4xl">
                  <span className="text-white">The </span>
                  <span className="text-brand-gold">Spice Heart</span>
                </h3>
                <p className="mx-auto mt-4 max-w-md text-sm text-white/70 leading-relaxed">
                  Our spices originate from India&apos;s most fertile spice-growing
                  regions. Our facilities in Gujarat — the heart of India&apos;s
                  spice trade — ensure freshness from farm to shelf.
                </p>

                <a
                  href="https://maps.google.com/?q=Unjha+Gujarat+India"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-8 inline-flex items-center gap-2 rounded-full border border-brand-gold/40 px-6 py-3 text-sm font-semibold text-brand-gold transition-all hover:bg-brand-gold/10 hover:border-brand-gold hover:shadow-[0_4px_20px_rgba(212,160,23,0.2)]"
                >
                  Get Directions
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
