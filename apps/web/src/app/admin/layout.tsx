"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { SITE_INFO } from "@/lib/constants";

const ADMIN_NAV = [
  { name: "Dashboard", href: "/admin", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { name: "Products", href: "/admin/products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { name: "General Store", href: "/admin/general-store", icon: "M3 3h18v18H3zM7 7h10M7 12h10M7 17h6" },
  { name: "Categories", href: "/admin/categories", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { name: "Orders", href: "/admin/orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { name: "Time Slots", href: "/admin/timeslots", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
];

function isSuperAdminRole(role?: string | null) {
  return ["SUPER_ADMIN", "super_admin", "superadmin"].includes(role ?? "");
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isPending) {
      if (!session || !["ADMIN", "admin", "SUPER_ADMIN", "super_admin", "superadmin"].includes(session.user.role ?? "")) {
        router.push("/");
      } else {
        setAuthorized(true);
      }
    }
  }, [session, isPending, router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-maroon"></div>
      </div>
    );
  }

  return (
    <div className="-mt-16 min-h-screen bg-gray-50 flex lg:-mt-20">
      {sidebarOpen && <button type="button" aria-label="Close admin navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-gray-900/30" />}
      {/* Sidebar drawer */}
      <aside className={`${sidebarOpen ? "flex" : "hidden"} fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex-col shadow-xl`}>
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10">
              <Image src="/images/madhavjimasala_logo_tbg.png" alt="Logo" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-brand-dark font-serif">{SITE_INFO.name}</span>
              <span className="text-[10px] uppercase tracking-widest text-brand-gold">Admin Portal</span>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {[...ADMIN_NAV, ...(isSuperAdminRole(session?.user.role)
            ? [{ name: "Settings", href: "/admin/settings", icon: "M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM19.4 15a1.7 1.7 0 00.3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6v.2h-2.5V20a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.6-1H6v-2.5h.2a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 001.9.3 1.7 1.7 0 001-1.6V5h2.5v.2a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 00-.3 1.9 1.7 1.7 0 001.6 1h.2v2.5h-.2a1.7 1.7 0 00-1.6 1z" }] : [])].map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            return (
              <Link key={item.name} href={item.href} onClick={() => setSidebarOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? "bg-brand-maroon text-white shadow-md shadow-brand-maroon/20" : "text-gray-600 hover:bg-red-50 hover:text-brand-maroon"}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="font-semibold text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={async () => {
              await authClient.signOut();
              router.push("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-600 hover:text-brand-maroon transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open admin navigation" className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:border-brand-maroon hover:text-brand-maroon">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="font-bold text-brand-dark">Admin Portal</span>
          </div>
          <span className="text-xs text-gray-500">{session?.user.name || "Admin"}</span>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
