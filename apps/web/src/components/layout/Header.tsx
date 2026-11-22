"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_INFO } from "@/lib/constants";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { useCart } from "@/contexts/CartContext";
import { authClient } from "@/lib/auth-client";
import { isBackofficeRole } from "@/lib/admin-roles";

type DesktopMenu = "shop" | "discover" | "account";

function MobileNavGroup({
  label,
  menu,
  openMenu,
  setOpenMenu,
  active,
  links,
  footer,
}: {
  label: string;
  menu: DesktopMenu;
  openMenu: DesktopMenu | null;
  setOpenMenu: (menu: DesktopMenu | null) => void;
  active: boolean;
  links: Array<{ label: string; href: string }>;
  footer?: ReactNode;
}) {
  const isOpen = openMenu === menu;

  return (
    <div className="border-b border-brand-border/70 pb-3 last:border-b-0">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setOpenMenu(isOpen ? null : menu)}
        className={`flex w-full items-center justify-between py-2 text-left text-sm font-bold uppercase tracking-widest transition-colors ${active || isOpen ? "text-brand-maroon" : "text-brand-dark/80 hover:text-brand-maroon"}`}
      >
        {label}
        <svg className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <div className="mt-1 space-y-1 pl-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpenMenu(null)}
              className={`block rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${pathnameForLink(link.href) ? "text-brand-maroon" : "text-brand-dark/65 hover:bg-brand-cream hover:text-brand-maroon"}`}
            >
              {link.label}
            </Link>
          ))}
          {footer && <div className="border-t border-brand-border/70 pt-1">{footer}</div>}
        </div>
      )}
    </div>
  );
}

function pathnameForLink(href: string) {
  if (typeof window === "undefined") return false;
  return window.location.pathname === href || (href !== "/" && window.location.pathname.startsWith(href));
}

function DesktopNavMenu({
  label,
  menu,
  openMenu,
  setOpenMenu,
  active,
  links,
  footer,
}: {
  label: string;
  menu: DesktopMenu;
  openMenu: DesktopMenu | null;
  setOpenMenu: (menu: DesktopMenu | null) => void;
  active: boolean;
  links: Array<{ label: string; href: string }>;
  footer?: ReactNode;
}) {
  const isOpen = openMenu === menu;

  return (
    <div className="relative" onMouseLeave={() => setOpenMenu(null)}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setOpenMenu(isOpen ? null : menu)}
        className={`flex items-center gap-1 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors 2xl:text-xs 2xl:tracking-widest ${active || isOpen ? "text-brand-maroon" : "text-brand-dark hover:text-brand-maroon"}`}
      >
        {label}
        <svg className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute left-1/2 top-full z-50 min-w-48 -translate-x-1/2 overflow-hidden rounded-xl border border-brand-border bg-white py-2 shadow-xl">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpenMenu(null)} className="block px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-brand-dark hover:bg-brand-cream hover:text-brand-maroon">
              {link.label}
            </Link>
          ))}
          {footer && <div className="mt-1 border-t border-brand-border pt-1">{footer}</div>}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<"shop" | "discover" | "account" | null>(null);
  const pathname = usePathname();
  const { cartItems } = useCart();
  const { data: session } = authClient.useSession();
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const canAccessAdminPanel = isBackofficeRole(session?.user?.role);
  const loginHref = pathname ? `/login?callbackUrl=${encodeURIComponent(pathname)}` : "/login";


  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDesktopMenu(null);
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
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 xl:flex 2xl:gap-4">
            <Link href="/" className={`px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors 2xl:text-xs 2xl:tracking-widest ${pathname === "/" ? "text-brand-maroon" : "text-brand-dark hover:text-brand-maroon"}`}>
              Home
            </Link>

            <DesktopNavMenu
              label="Shop"
              menu="shop"
              openMenu={openDesktopMenu}
              setOpenMenu={setOpenDesktopMenu}
              active={pathname === "/products" || pathname?.startsWith("/general-store") || pathname === "/orders"}
              links={[
                { label: "Products", href: "/products" },
                { label: "General Store", href: "/general-store" },
                { label: "Your Orders", href: "/orders" },
              ]}
            />
            <DesktopNavMenu
              label="Discover"
              menu="discover"
              openMenu={openDesktopMenu}
              setOpenMenu={setOpenDesktopMenu}
              active={["/about", "/certifications", "/contact"].includes(pathname ?? "")}
              links={[
                { label: "About Us", href: "/about" },
                { label: "Certifications", href: "/certifications" },
                { label: "Contact", href: "/contact" },
              ]}
            />
            <DesktopNavMenu
              label="Account"
              menu="account"
              openMenu={openDesktopMenu}
              setOpenMenu={setOpenDesktopMenu}
              active={pathname?.startsWith("/admin")}
              links={[
                ...(canAccessAdminPanel ? [{ label: "Admin Panel", href: "/admin" }] : []),
              ]}
              footer={session?.user ? (
                <button type="button" onClick={() => void authClient.signOut()} className="w-full px-4 py-2 text-left text-xs font-bold uppercase tracking-widest text-brand-dark hover:bg-brand-cream hover:text-brand-maroon">
                  Logout
                </button>
              ) : (
                <Link href={loginHref} className="block px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-dark hover:bg-brand-cream hover:text-brand-maroon">
                  Login
                </Link>
              )}
            />
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4 2xl:gap-6">
            <Link
              href="/cart"
              aria-label={`Shopping cart${cartItemCount > 0 ? `, ${cartItemCount} items` : ""}`}
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
              <motion.div variants={{ closed: { opacity: 0, x: -15 }, open: { opacity: 1, x: 0 } }} transition={{ duration: 0.3, ease: "easeOut" }}>
                <Link href="/" className={`block py-2 text-sm font-bold uppercase tracking-widest transition-colors ${pathname === "/" ? "text-brand-maroon" : "text-brand-dark/70 hover:text-brand-maroon"}`}>
                  Home
                </Link>
              </motion.div>
              <motion.div variants={{ closed: { opacity: 0, x: -15 }, open: { opacity: 1, x: 0 } }} transition={{ duration: 0.3, ease: "easeOut" }}>
                <MobileNavGroup
                  label="Shop"
                  menu="shop"
                  openMenu={openDesktopMenu}
                  setOpenMenu={setOpenDesktopMenu}
                  active={pathname === "/products" || pathname?.startsWith("/general-store") || pathname === "/orders"}
                  links={[{ label: "Products", href: "/products" }, { label: "General Store", href: "/general-store" }, { label: "Your Orders", href: "/orders" }]}
                />
              </motion.div>
              <motion.div variants={{ closed: { opacity: 0, x: -15 }, open: { opacity: 1, x: 0 } }} transition={{ duration: 0.3, ease: "easeOut" }}>
                <MobileNavGroup
                  label="Discover"
                  menu="discover"
                  openMenu={openDesktopMenu}
                  setOpenMenu={setOpenDesktopMenu}
                  active={["/about", "/certifications", "/contact"].includes(pathname ?? "")}
                  links={[{ label: "About Us", href: "/about" }, { label: "Certifications", href: "/certifications" }, { label: "Contact", href: "/contact" }]}
                />
              </motion.div>
              <motion.div variants={{ closed: { opacity: 0, x: -15 }, open: { opacity: 1, x: 0 } }} transition={{ duration: 0.3, ease: "easeOut" }}>
                <MobileNavGroup
                  label="Account"
                  menu="account"
                  openMenu={openDesktopMenu}
                  setOpenMenu={setOpenDesktopMenu}
                  active={pathname?.startsWith("/admin")}
                  links={canAccessAdminPanel ? [{ label: "Admin Panel", href: "/admin" }] : []}
                  footer={session?.user ? (
                    <button type="button" onClick={() => void authClient.signOut()} className="block w-full px-3 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-brand-dark/65 hover:text-brand-maroon">Logout</button>
                  ) : (
                    <Link href={loginHref} onClick={() => setOpenDesktopMenu(null)} className="block px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-brand-dark/65 hover:text-brand-maroon">Login</Link>
                  )}
                />
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
