"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { YEAR_OF_ESTABLISHMENT } from "@/lib/constants";

export default function LogoSplash() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Check if splash was already shown this session
    try {
      if (!sessionStorage.getItem("madhavji-splash-shown")) {
        setShowSplash(true);
        const exitTimer = setTimeout(() => {
          setShowSplash(false);
          sessionStorage.setItem("madhavji-splash-shown", "1");
        }, 3000);
        return () => clearTimeout(exitTimer);
      }
    } catch {
      // SSR or sessionStorage unavailable
    }
  }, []);

  const dismiss = useCallback(() => {
    setShowSplash(false);
    try {
      sessionStorage.setItem("madhavji-splash-shown", "1");
    } catch {
      // ignore
    }
  }, []);

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          onClick={dismiss}
          role="presentation"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-[linear-gradient(145deg,#1A0A0A_0%,#2D1010_30%,#1A0A0A_100%)]"
        >
          {/* Subtle radial ambient glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,160,23,0.06)_0%,transparent_70%)] pointer-events-none" />

          {/* Animated background particles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className="splash-particle"
                style={{
                  left: `${10 + ((i * 37) % 80)}%`,
                  top: `${5 + ((i * 53) % 90)}%`,
                  animationDelay: `${0.2 + (i * 0.15)}s`,
                  animationDuration: `${2.5 + (i % 3)}s`,
                  width: `${3 + (i % 4)}px`,
                  height: `${3 + (i % 4)}px`,
                }}
              />
            ))}
          </div>

          {/* Radial glow behind logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(212,160,23,0.15)_0%,rgba(139,26,26,0.08)_40%,transparent_70%)] pointer-events-none"
          />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="relative w-[260px] h-[260px]"
          >
            <div className="splash-ring" />
            <Image
              src="/images/madhavjimasala_OnLoadLogo.png"
              alt="Madhavji Masala"
              width={260}
              height={260}
              priority
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 0 30px rgba(212, 160, 23, 0.3)) drop-shadow(0 4px 20px rgba(0, 0, 0, 0.5))",
              }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease: "easeOut" }}
            className="mt-6 font-playfair text-[1.35rem] font-medium tracking-[0.15em] text-[rgba(232,197,71,0.9)] text-center"
          >
            Pure Spices. Authentic Taste.
          </motion.p>

          {/* Decorative line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
            className="h-px mt-4 bg-[linear-gradient(90deg,transparent,rgba(212,160,23,0.5),transparent)]"
          />

          {/* Since 1982 */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5, ease: "easeOut" }}
            className="mt-3 font-sans text-xs font-normal tracking-[0.3em] uppercase text-white/35"
          >
            Since {YEAR_OF_ESTABLISHMENT}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
