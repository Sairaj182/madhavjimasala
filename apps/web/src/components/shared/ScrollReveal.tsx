"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-in" | "fade-left" | "fade-right" | "scale-up";
  duration?: string;
  delay?: string;
  className?: string;
  threshold?: number;
}

export function ScrollReveal({
  children,
  animation = "fade-up",
  duration = "duration-700",
  delay = "delay-0",
  className = "",
  threshold = 0.1,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: "50px" }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [threshold]);

  const baseClasses = `transition-all ease-out ${duration} ${delay} ${className}`;
  
  let hiddenClasses = "";
  let visibleClasses = "opacity-100 translate-y-0 translate-x-0 scale-100";

  switch (animation) {
    case "fade-up":
      hiddenClasses = "opacity-0 translate-y-12";
      break;
    case "fade-in":
      hiddenClasses = "opacity-0";
      break;
    case "fade-left":
      hiddenClasses = "opacity-0 translate-x-12";
      break;
    case "fade-right":
      hiddenClasses = "opacity-0 -translate-x-12";
      break;
    case "scale-up":
      hiddenClasses = "opacity-0 scale-95";
      break;
  }

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${isVisible ? visibleClasses : hiddenClasses}`}
    >
      {children}
    </div>
  );
}
