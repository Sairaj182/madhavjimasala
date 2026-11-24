"use client";

import { useState, useEffect, useCallback } from "react";
import { YEAR_OF_ESTABLISHMENT } from "@/lib/constants";

const WORDMARK = "MADHAVJI MASALA";
const LETTER_DELAY_MS = 78;
const DATE_DELAY_MS = (WORDMARK.length - 1) * LETTER_DELAY_MS + 260;

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
    const exitTimer = setTimeout(() => setPhase("exit"), 3300);

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

      {/* Radial glow behind the wordmark */}
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

      <div
        className="relative w-full px-4 text-center font-heading"
        data-splash-revealing={phase !== "loading"}
      >
        <p className="splash-wordmark text-[clamp(1.4rem,7.5vw,5rem)] leading-none font-semibold tracking-[0.035em]">
          <span className="sr-only">{WORDMARK}</span>
          <span aria-hidden="true" className="whitespace-pre">
            {Array.from(WORDMARK, (letter, index) => (
              <span
                key={`${letter}-${index}`}
                className="splash-letter"
                style={{ animationDelay: `${index * LETTER_DELAY_MS}ms` }}
              >
                {letter}
              </span>
            ))}
          </span>
        </p>
        <p
          className="splash-date mt-4 text-[clamp(1.05rem,2.4vw,1.8rem)] leading-tight tracking-[0.06em] italic"
          style={{ animationDelay: `${DATE_DELAY_MS}ms` }}
        >
          since {YEAR_OF_ESTABLISHMENT}
        </p>
      </div>
    </div>
  );
}
