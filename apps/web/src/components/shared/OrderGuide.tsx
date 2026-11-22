"use client";

import { useState } from "react";
import Link from "next/link";

const steps = [
  { number: "01", title: "Open General Store", gujarati: "General Store ખોલો", detail: "Open the General Store and browse the products available for pickup.", action: "Explore Products", href: "/general-store" },
  { number: "02", title: "Sign in or create an account", gujarati: "Sign In કરો અથવા નવું account બનાવો", detail: "Tap Sign In. New customers can choose Sign Up, enter their name, email, and password, then continue.", action: "Sign In / Sign Up", href: "/login?callbackUrl=%2Forder-guide" },
  { number: "03", title: "Choose products and quantity", gujarati: "વસ્તુ અને quantity પસંદ કરો", detail: "Open a product, select its packing or loose quantity when available, then add it to your cart.", action: "Browse Store", href: "/general-store" },
  { number: "04", title: "Review your cart", gujarati: "તમારો cart તપાસો", detail: "Check the product, packing, quantity, and total. Remove anything you do not need, then choose Proceed to Checkout.", action: "Open Cart", href: "/cart" },
  { number: "05", title: "Choose pickup and place order", gujarati: "Pickup સમય પસંદ કરીને order કરો", detail: "Enter the customer and pickup person names, select an available pickup slot, and confirm the order. Payment is made at pickup.", action: "Checkout", href: "/checkout" },
  { number: "06", title: "Track your order", gujarati: "તમારો order track કરો", detail: "Open Orders to see your pickup number and order status. Enable order notifications to receive updates on this device.", action: "View Orders", href: "/orders" },
];

export default function OrderGuide() {
  const [language, setLanguage] = useState<"bilingual" | "english">("bilingual");
  const bilingual = language === "bilingual";

  return (
    <main className="min-h-screen bg-brand-cream/30 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-gold">Madhavji Masala General Store</p>
          <h1 className="mt-3 font-heading text-3xl font-bold text-brand-dark sm:text-5xl">How to place your order</h1>
          <p className="mt-4 text-base leading-7 text-brand-gray sm:text-lg">Six simple steps from choosing your products to collecting your order.</p>
          {bilingual && <p className="mt-2 text-sm text-brand-gray">General Storeમાંથી order કરવાની સરળ રીત</p>}

          <div className="mt-6 inline-flex rounded-full border border-brand-border bg-white p-1 shadow-sm" role="group" aria-label="Guide language">
            <button type="button" onClick={() => setLanguage("bilingual")} className={`rounded-full px-4 py-2 text-xs font-bold transition ${bilingual ? "bg-brand-maroon text-white" : "text-brand-gray hover:text-brand-maroon"}`}>
              English + ગુજરાતી
            </button>
            <button type="button" onClick={() => setLanguage("english")} className={`rounded-full px-4 py-2 text-xs font-bold transition ${!bilingual ? "bg-brand-maroon text-white" : "text-brand-gray hover:text-brand-maroon"}`}>
              English only
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number} className="flex flex-col rounded-2xl border border-brand-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-brand-gold/70">{step.number}</span>
                <span className="rounded-full bg-brand-cream px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-maroon">Step</span>
              </div>
              <h2 className="mt-5 text-lg font-bold text-brand-dark">{step.title}</h2>
              {bilingual && <p className="mt-1 text-sm font-semibold text-brand-maroon">{step.gujarati}</p>}
              <p className="mt-4 flex-1 text-sm leading-6 text-brand-gray">{step.detail}</p>
              <Link href={step.href} className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-maroon px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-brand-maroon-dark">
                {step.action}
              </Link>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-brand-gold/30 bg-white p-6 text-center shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-brand-dark">Quick reminders</h2>
          <div className="mt-4 grid gap-3 text-left text-sm leading-6 text-brand-gray sm:grid-cols-3">
            <p><span className="font-bold text-brand-maroon">Pickup:</span> Choose a slot with available capacity.</p>
            <p><span className="font-bold text-brand-maroon">Payment:</span> Pay at the store when collecting your order.</p>
            <p><span className="font-bold text-brand-maroon">Updates:</span> Enable order notifications from the Orders page.</p>
          </div>
          {bilingual && <p className="mt-5 text-sm text-brand-gray">Pickup slot પસંદ કરો, સ્ટોર પર payment કરો, અને Orders page પરથી status જુઓ.</p>}
        </div>
      </div>
    </main>
  );
}
