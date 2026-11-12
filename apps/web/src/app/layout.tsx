import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LogoSplash from "@/components/layout/LogoSplash";
import PwaRegistration from "@/components/layout/PwaRegistration";
import { PAGE_META } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: PAGE_META.home.title,
  description: PAGE_META.home.description,
  keywords: PAGE_META.home.keywords,
  openGraph: {
    title: PAGE_META.home.title,
    description: PAGE_META.home.description,
    type: "website",
    locale: "en_IN",
    siteName: "Madhavji Masala",
  },
};

import { CartProvider } from "@/contexts/CartContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <LogoSplash />
          <PwaRegistration />
          <Header />
          <main className="flex-1 pt-16 lg:pt-20">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
