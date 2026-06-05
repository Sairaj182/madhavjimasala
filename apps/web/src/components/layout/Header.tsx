"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SITE_INFO } from "@/lib/constants";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.08)]"
          : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/madhavjimasala_logo_tbg.png"
              alt={SITE_INFO.logoAlt}
              width={52}
              height={52}
              className="h-10 w-10 sm:h-11 sm:w-11 lg:h-[52px] lg:w-[52px] transition-transform duration-300 group-hover:scale-105"
              style={{ objectFit: 'contain' }}
            />
            <span className="text-xl font-bold font-heading text-brand-maroon lg:text-2xl tracking-tight">
              {SITE_INFO.name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
                  pathname === link.href
                    ? "text-brand-maroon"
                    : "text-brand-dark/70 hover:text-brand-maroon hover:bg-brand-cream/60"
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-brand-maroon" />
                )}
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden rounded-full bg-brand-maroon px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-maroon-dark hover:shadow-lg sm:inline-flex"
            >
              Order in Bulk
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-brand-cream lg:hidden"
              aria-label="Toggle menu"
            >
              <div className="flex w-5 flex-col gap-[5px]">
                <span
                  className={`h-[2px] w-full rounded-full bg-brand-dark transition-all duration-300 ${
                    isMobileMenuOpen ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`h-[2px] w-full rounded-full bg-brand-dark transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`h-[2px] w-full rounded-full bg-brand-dark transition-all duration-300 ${
                    isMobileMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden border-t border-brand-border bg-white transition-all duration-300 lg:hidden ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-brand-cream text-brand-maroon"
                    : "text-brand-dark/70 hover:bg-brand-cream/60 hover:text-brand-maroon"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="mt-2 rounded-full bg-brand-maroon px-5 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-brand-maroon-dark"
            >
              Order in Bulk
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
