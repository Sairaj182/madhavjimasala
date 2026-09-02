import { ScrollReveal } from "./ScrollReveal";

interface SectionDividerProps {
  variant?: "diamond" | "leaf" | "line";
  className?: string;
}

export default function SectionDivider({
  variant = "diamond",
  className = "",
}: SectionDividerProps) {
  return (
    <ScrollReveal animation="fade-in">
      <div
        className={`flex items-center justify-center gap-3 py-2 select-none ${className}`}
        aria-hidden="true"
      >
        {/* Left line */}
        <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-brand-gold/40 to-brand-gold/60" />

        {/* Center motif */}
        {variant === "diamond" && (
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-1 rotate-45 bg-brand-gold/40" />
            <div className="h-2 w-2 rotate-45 border border-brand-gold/60 bg-brand-gold/10" />
            <div className="h-1 w-1 rotate-45 bg-brand-gold/40" />
          </div>
        )}

        {variant === "leaf" && (
          <svg
            className="h-5 w-5 text-brand-gold/50"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
          </svg>
        )}

        {variant === "line" && (
          <div className="h-1.5 w-1.5 rounded-full bg-brand-gold/50" />
        )}

        {/* Right line */}
        <div className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent via-brand-gold/40 to-brand-gold/60" />
      </div>
    </ScrollReveal>
  );
}
