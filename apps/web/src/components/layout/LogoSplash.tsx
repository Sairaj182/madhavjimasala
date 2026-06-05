"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function LogoSplash() {
  const [phase, setPhase] = useState<
    "loading" | "reveal" | "exit" | "done"
  >("loading");

  const dismiss = useCallback(() => {
    if (phase === "reveal") {
      setPhase("exit");
    }
  }, [phase]);

  useEffect(() => {
    // Check if splash was already shown this session
    try {
      if (sessionStorage.getItem("madhavji-splash-shown")) {
        setPhase("done");
        return;
      }
    } catch {
      // SSR or sessionStorage unavailable
    }

    // Phase timeline
    const revealTimer = setTimeout(() => setPhase("reveal"), 300);
    const exitTimer = setTimeout(() => setPhase("exit"), 3000);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  useEffect(() => {
    if (phase === "exit") {
      const timer = setTimeout(() => {
        setPhase("done");
        try {
          sessionStorage.setItem("madhavji-splash-shown", "1");
        } catch {
          // ignore
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      onClick={dismiss}
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(145deg, #1A0A0A 0%, #2D1010 30%, #1A0A0A 100%)",
        cursor: "pointer",
        overflow: "hidden",
        opacity: phase === "exit" ? 0 : 1,
        transform: phase === "exit" ? "scale(1.05)" : "scale(1)",
        transition:
          "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: phase === "exit" ? "none" : "auto",
      }}
    >
      {/* Subtle radial ambient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(212, 160, 23, 0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Animated background particles */}
      <div
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
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
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(212, 160, 23, 0.15) 0%, rgba(139, 26, 26, 0.08) 40%, transparent 70%)",
          opacity: phase === "reveal" ? 1 : 0,
          transform: phase === "reveal" ? "scale(1)" : "scale(0.5)",
          transition:
            "opacity 1.2s ease-out 0.2s, transform 1.2s ease-out 0.2s",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div
        style={{
          position: "relative",
          width: 260,
          height: 260,
          opacity: phase === "reveal" ? 1 : 0,
          transform:
            phase === "reveal"
              ? "scale(1) rotate(0deg)"
              : "scale(0.3) rotate(-10deg)",
          transition:
            "opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s",
        }}
      >
        {/* Pulsing ring */}
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
            filter:
              "drop-shadow(0 0 30px rgba(212, 160, 23, 0.3)) drop-shadow(0 4px 20px rgba(0, 0, 0, 0.5))",
          }}
        />
      </div>

      {/* Tagline */}
      <p
        style={{
          marginTop: "1.5rem",
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "1.35rem",
          fontWeight: 500,
          letterSpacing: "0.15em",
          color: "rgba(232, 197, 71, 0.9)",
          opacity: phase === "reveal" ? 1 : 0,
          transform:
            phase === "reveal" ? "translateY(0)" : "translateY(16px)",
          transition:
            "opacity 0.7s ease-out 0.9s, transform 0.7s ease-out 0.9s",
        }}
      >
        Pure Spices. Authentic Taste.
      </p>

      {/* Decorative line */}
      <div
        style={{
          width: phase === "reveal" ? 120 : 0,
          height: 1,
          marginTop: "1rem",
          background:
            "linear-gradient(90deg, transparent, rgba(212, 160, 23, 0.5), transparent)",
          transition: "width 0.8s ease-out 1.2s",
        }}
      />

      {/* Since 1982 */}
      <p
        style={{
          marginTop: "0.75rem",
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: "0.75rem",
          fontWeight: 400,
          letterSpacing: "0.3em",
          textTransform: "uppercase" as const,
          color: "rgba(255, 255, 255, 0.35)",
          opacity: phase === "reveal" ? 1 : 0,
          transform:
            phase === "reveal" ? "translateY(0)" : "translateY(10px)",
          transition:
            "opacity 0.6s ease-out 1.5s, transform 0.6s ease-out 1.5s",
        }}
      >
        Since 1982
      </p>
    </div>
  );
}
