"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SITE_INFO } from "@/lib/constants";
import Image from "next/image";

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-lg shadow-sm border-b border-brand-border/50 py-2"
          : "bg-white py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group min-w-0">
            {/* Logo Image */}
            <div className="relative shrink-0 h-14 w-14 sm:h-20 sm:w-20 transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110">
              <Image
                src="/images/madhavjimasala_logo_tbg.png"
                alt={SITE_INFO.logoAlt}
                fill
                className="object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all duration-500"
                priority
              />
            </div>

            {/* Elegant Divider (Desktop) */}
            <div className="hidden sm:block h-8 w-[1px] bg-gradient-to-b from-transparent via-[var(--color-brand-gold)] to-transparent mx-4 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Typography */}
            <div className="flex flex-col ml-3 sm:ml-0 justify-center">
              <span className="text-base sm:text-lg lg:text-xl font-bold font-heading text-[var(--color-brand-maroon-dark)] tracking-wide truncate leading-tight group-hover:text-[var(--color-brand-maroon)] transition-colors">
                {SITE_INFO.name}
              </span>
              <span className="block text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.15em] sm:tracking-[0.25em] uppercase text-[var(--color-brand-gold)] font-semibold opacity-90 mt-0.5">
                Pure Spices. Authentic Taste.
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative py-2 text-xs font-bold uppercase tracking-widest text-brand-dark transition-colors hover:text-brand-maroon"
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-brand-maroon transition-all duration-300 ${
                    pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-6">
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center justify-center border border-brand-maroon bg-transparent px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-brand-maroon transition-all duration-300 hover:bg-brand-maroon hover:text-white hover:shadow-lg"
            >
              Order in Bulk
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative flex h-10 w-8 sm:w-10 items-center justify-end transition-colors lg:hidden text-[var(--color-brand-dark)] hover:text-[var(--color-brand-maroon)]"
              aria-label="Toggle menu"
            >
              <div className="flex w-4 sm:w-6 flex-col gap-1 sm:gap-1.5">
                <span
                  className={`h-[2px] w-full bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? "translate-y-[6px] sm:translate-y-[8px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`h-[2px] w-full bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`h-[2px] w-full bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? "-translate-y-[6px] sm:-translate-y-[8px] -rotate-45" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`absolute left-0 right-0 top-full overflow-hidden border-t border-brand-border bg-white shadow-xl transition-all duration-300 lg:hidden ${
          isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                pathname === link.href
                  ? "text-brand-maroon"
                  : "text-brand-dark/70 hover:text-brand-maroon"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 pt-4 border-t border-brand-border">
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center bg-brand-maroon px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-brand-maroon-dark"
            >
              Order in Bulk
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
