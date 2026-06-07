"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  animation?: "fade-up" | "fade-in" | "fade-left" | "fade-right" | "scale-up";
  duration?: string | number;
  delay?: string | number;
  className?: string;
  threshold?: number;
}

export function ScrollReveal({
  children,
  animation = "fade-up",
  duration = 0.7,
  delay = 0,
  className = "",
  threshold = 0.1,
}: ScrollRevealProps) {
  // Parse legacy Tailwind string delays/durations if present
  const numericDelay =
    typeof delay === "string" && delay.startsWith("delay-")
      ? parseInt(delay.replace("delay-", "")) / 1000
      : Number(delay) || 0;

  const numericDuration =
    typeof duration === "string" && duration.startsWith("duration-")
      ? parseInt(duration.replace("duration-", "")) / 1000
      : Number(duration) || 0.7;

  const getVariants = () => {
    switch (animation) {
      case "fade-up":
        return {
          hidden: { opacity: 0, y: 40 },
          visible: { opacity: 1, y: 0 },
        };
      case "fade-in":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
      case "fade-left":
        return {
          hidden: { opacity: 0, x: 40 },
          visible: { opacity: 1, x: 0 },
        };
      case "fade-right":
        return {
          hidden: { opacity: 0, x: -40 },
          visible: { opacity: 1, x: 0 },
        };
      case "scale-up":
        return {
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 },
        };
    }
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -50px 0px", amount: threshold }}
      variants={getVariants()}
      transition={{
        duration: numericDuration,
        delay: numericDelay,
        ease: [0.21, 0.47, 0.32, 0.98], // smooth luxurious cubic bezier
      }}
    >
      {children}
    </motion.div>
  );
}
