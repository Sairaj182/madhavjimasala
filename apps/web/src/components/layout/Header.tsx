"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SITE_INFO } from "@/lib/constants";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { useCart } from "@/contexts/CartContext";
import { authClient } from "@/lib/auth-client";

const ADMIN_ROLES = new Set(["ADMIN", "admin", "SUPER_ADMIN", "super_admin", "superadmin"]);

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { cartItems } = useCart();
  const { data: session } = authClient.useSession();
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const canAccessAdminPanel = ADMIN_ROLES.has(session?.user?.role ?? "");


  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-lg shadow-sm border-b border-brand-border/50 py-2"
          : "bg-white py-4"
      }`}
    >
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 min-w-0 items-center gap-4 lg:h-20">
          {/* Logo */}
          <Link href="/" className="group flex min-w-0 shrink-0 items-center">
            {/* Logo Image */}
            <div className="relative h-14 w-14 shrink-0 transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110 sm:h-16 sm:w-16 lg:h-[4.5rem] lg:w-[4.5rem]">
              <Image
                src="/images/madhavjimasala_logo_tbg.png"
                alt={SITE_INFO.logoAlt}
                fill
                className="object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all duration-500"
                priority
              />
            </div>

            {/* Elegant Divider (Desktop) */}
            <div className="mx-3 hidden h-8 w-px bg-gradient-to-b from-transparent via-[var(--color-brand-gold)] to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100 sm:block lg:mx-4" />

            {/* Typography */}
            <div className="flex flex-col ml-3 sm:ml-0 justify-center">
              <span className="text-base sm:text-lg lg:text-xl font-bold font-heading text-[var(--color-brand-name)] tracking-wide truncate leading-tight group-hover:text-[var(--color-brand-dark)] transition-colors font-serif">
                {SITE_INFO.name}
              </span>
              <span className="block text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.15em] sm:tracking-[0.25em] uppercase text-[var(--color-brand-gold)] font-semibold opacity-90 mt-0.5">
                The Bagasrawala's
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 xl:flex 2xl:gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative whitespace-nowrap py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-dark transition-colors hover:text-brand-maroon 2xl:text-xs 2xl:tracking-widest"
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-brand-maroon transition-all duration-300 ${
                    pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
            <Link
              href="/orders"
              className={`group relative whitespace-nowrap py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors 2xl:text-xs 2xl:tracking-widest ${
                pathname === "/orders" ? "text-brand-maroon" : "text-brand-dark hover:text-brand-maroon"
              }`}
            >
              Orders
              <span className={`absolute bottom-0 left-0 h-[2px] bg-brand-maroon transition-all duration-300 ${
                pathname === "/orders" ? "w-full" : "w-0 group-hover:w-full"
              }`} />
            </Link>
            {canAccessAdminPanel && (
              <Link
                href="/admin"
                className={`group relative whitespace-nowrap py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors 2xl:text-xs 2xl:tracking-widest ${
                  pathname?.startsWith("/admin") ? "text-brand-maroon" : "text-brand-dark hover:text-brand-maroon"
                }`}
              >
                Admin Panel
                <span className={`absolute bottom-0 left-0 h-[2px] bg-brand-maroon transition-all duration-300 ${
                  pathname?.startsWith("/admin") ? "w-full" : "w-0 group-hover:w-full"
                }`} />
              </Link>
            )}
            {session?.user ? (
              <button
                onClick={() => void authClient.signOut()}
                className="group relative whitespace-nowrap py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-dark hover:text-brand-maroon 2xl:text-xs 2xl:tracking-widest"
              >
                Logout
              </button>
            ) : (
              <Link href="/login" className="group relative whitespace-nowrap py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-dark hover:text-brand-maroon 2xl:text-xs 2xl:tracking-widest">
                Login
              </Link>
            )}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4 2xl:gap-6">
            <Link
              href="/cart"
              className="relative flex items-center justify-center p-2 text-brand-dark hover:text-brand-maroon transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-maroon rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <Link
              href="/contact"
              className="hidden items-center justify-center whitespace-nowrap border border-brand-maroon bg-transparent px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-maroon transition-all duration-300 hover:bg-brand-maroon hover:text-white hover:shadow-lg sm:inline-flex 2xl:px-6 2xl:text-xs 2xl:tracking-widest"
            >
              Order in Bulk
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative flex h-10 w-8 items-center justify-end text-[var(--color-brand-dark)] transition-colors hover:text-[var(--color-brand-maroon)] xl:hidden sm:w-10"
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
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute left-0 right-0 top-full overflow-hidden border-t border-brand-border bg-white shadow-xl xl:hidden"
          >
            <motion.nav 
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
                closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
              }}
              className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8"
            >
              {NAV_LINKS.map((link) => (
                <motion.div
                  key={link.href}
                  variants={{
                    closed: { opacity: 0, x: -15 },
                    open: { opacity: 1, x: 0 }
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Link
                    href={link.href}
                    className={`block text-sm font-bold uppercase tracking-widest transition-colors ${
                      pathname === link.href
                        ? "text-brand-maroon"
                        : "text-brand-dark/70 hover:text-brand-maroon"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                variants={{
                  closed: { opacity: 0, x: -15 },
                  open: { opacity: 1, x: 0 }
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Link href="/orders" className="block text-sm font-bold uppercase tracking-widest text-brand-dark/70 hover:text-brand-maroon">
                  Orders
                </Link>
              </motion.div>
              {canAccessAdminPanel && (
                <motion.div
                  variants={{
                    closed: { opacity: 0, x: -15 },
                    open: { opacity: 1, x: 0 }
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Link href="/admin" className="block text-sm font-bold uppercase tracking-widest text-brand-dark/70 hover:text-brand-maroon">
                    Admin Panel
                  </Link>
                </motion.div>
              )}
              <motion.div
                variants={{
                  closed: { opacity: 0, x: -15 },
                  open: { opacity: 1, x: 0 }
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {session?.user ? (
                  <button onClick={() => void authClient.signOut()} className="block text-sm font-bold uppercase tracking-widest text-brand-dark/70 hover:text-brand-maroon">
                    Logout
                  </button>
                ) : (
                  <Link href="/login" className="block text-sm font-bold uppercase tracking-widest text-brand-dark/70 hover:text-brand-maroon">
                    Login
                  </Link>
                )}
              </motion.div>
              <motion.div 
                variants={{
                  closed: { opacity: 0, y: 10 },
                  open: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mt-4 pt-4 border-t border-brand-border"
              >
                <Link
                  href="/contact"
                  className="inline-flex w-full items-center justify-center bg-brand-maroon px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-brand-maroon-dark"
                >
                  Order in Bulk
                </Link>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
