"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CONTACT_INFO, PAGE_META } from "@/lib/constants";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Phase 1: Just show success state. Phase 2: API integration.
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormState({ name: "", email: "", message: "" });
  };

  return (
    <>
      {/* Hero */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl font-bold text-brand-dark sm:text-5xl lg:text-6xl">
              Let&apos;s Talk Spices.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-brand-gray">
              From global wholesale inquiries to artisanal spice sourcing, our
              team is ready to curate the perfect flavor profile for your
              business.
            </p>
          </div>
        </div>
      </section>

      {/* Form + Contact Info */}
      <section className="pb-16 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-brand-border bg-white p-8 shadow-card lg:p-10">
                <h2 className="font-heading text-2xl font-bold text-brand-dark">
                  Business Inquiry
                </h2>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-sm font-medium text-brand-dark"
                      >
                        Full Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        placeholder="John Doe"
                        value={formState.name}
                        onChange={(e) =>
                          setFormState((s) => ({ ...s, name: e.target.value }))
                        }
                        required
                        className="mt-2 w-full rounded-xl border border-brand-border bg-brand-cream/40 px-4 py-3 text-sm text-brand-dark placeholder-brand-gray-light outline-none transition-all focus:border-brand-maroon focus:ring-2 focus:ring-brand-maroon/10"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-sm font-medium text-brand-dark"
                      >
                        Work Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        placeholder="john@company.com"
                        value={formState.email}
                        onChange={(e) =>
                          setFormState((s) => ({ ...s, email: e.target.value }))
                        }
                        required
                        className="mt-2 w-full rounded-xl border border-brand-border bg-brand-cream/40 px-4 py-3 text-sm text-brand-dark placeholder-brand-gray-light outline-none transition-all focus:border-brand-maroon focus:ring-2 focus:ring-brand-maroon/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-sm font-medium text-brand-dark"
                    >
                      Requirement Details
                    </label>
                    <textarea
                      id="contact-message"
                      placeholder="Tell us about your bulk needs or specific spice interests..."
                      rows={5}
                      value={formState.message}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, message: e.target.value }))
                      }
                      required
                      className="mt-2 w-full resize-none rounded-xl border border-brand-border bg-brand-cream/40 px-4 py-3 text-sm text-brand-dark placeholder-brand-gray-light outline-none transition-all focus:border-brand-maroon focus:ring-2 focus:ring-brand-maroon/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitted}
                    className={`w-full rounded-xl py-4 text-sm font-semibold text-white transition-all duration-300 ${
                      submitted
                        ? "bg-green-600 cursor-default"
                        : "bg-brand-maroon hover:bg-brand-maroon-dark hover:shadow-[0_8px_30px_rgba(139,26,26,0.3)]"
                    }`}
                  >
                    {submitted ? "✓ Inquiry Sent!" : "Send Inquiry"}
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
                className="group flex items-center gap-4 rounded-2xl bg-[#25D366] p-6 text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold">Quick Support</p>
                  <p className="text-xs text-white/80">
                    Chat with our export executive on WhatsApp
                  </p>
                </div>
                <svg className="ml-auto h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </a>

              {/* Corporate Office */}
              <div className="rounded-2xl border border-brand-border bg-white p-6 transition-all duration-300 hover:shadow-card">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-cream text-brand-maroon">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-dark">
                      {CONTACT_INFO.corporateOffice.label}
                    </h3>
                    {CONTACT_INFO.corporateOffice.address.map((line, i) => (
                      <p key={i} className="text-sm text-brand-gray">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Production Facility */}
              <div className="rounded-2xl border border-brand-border bg-white p-6 transition-all duration-300 hover:shadow-card">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-cream text-brand-maroon">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-dark">
                      {CONTACT_INFO.productionFacility.label}
                    </h3>
                    {CONTACT_INFO.productionFacility.address.map((line, i) => (
                      <p key={i} className="text-sm text-brand-gray">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="rounded-2xl border border-brand-border bg-white p-6 transition-all duration-300 hover:shadow-card">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-cream text-brand-maroon">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-dark">
                      Call or Email
                    </h3>
                    {CONTACT_INFO.phones.map((phone, i) => (
                      <p key={i} className="text-sm text-brand-gray">
                        <a href={`tel:${phone}`} className="hover:text-brand-maroon transition-colors">
                          {phone}
                        </a>
                      </p>
                    ))}
                    {CONTACT_INFO.emails.map((email, i) => (
                      <p key={i} className="text-sm text-brand-gray">
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

      {/* Map Section */}
      <section className="bg-brand-cream py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-brand-dark">
            {/* Map placeholder with India outline + Gujarat highlight */}
            <div className="flex items-center justify-center py-20 px-8">
              <div className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-maroon/20 text-brand-maroon">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-gold/10 px-4 py-2 text-xs font-bold text-brand-gold">
                  <span className="h-2 w-2 rounded-full bg-brand-gold animate-pulse" />
                  CERTIFIED ORIGIN
                </div>

                <h3 className="mt-4 font-heading text-2xl font-bold text-white sm:text-3xl">
                  The Spice Heart
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm text-white/60">
                  Our spices originate from India&apos;s most fertile spice-growing
                  regions. Our facilities in Gujarat — the heart of India&apos;s
                  spice trade — ensure freshness from farm to shelf.
                </p>

                <a
                  href="https://maps.google.com/?q=Unjha+Gujarat+India"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-maroon hover:text-brand-maroon-light transition-colors"
                >
                  Get Directions
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
