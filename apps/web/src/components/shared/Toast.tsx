
"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
};

export default function Toast({
  message,
  type = "success",
  onClose,
}: ToastProps) {

  useEffect(() => {
    // Play notification sound
    const audio = new Audio(
      type === "success"
        ? "/sounds/success.mp3"
        : "/sounds/error.mp3"
    );

    audio.volume = 0.5;

    audio.play().catch((error) => {
      console.warn("Unable to play notification sound:", error);
    });

    // Automatically close toast after 4 seconds
    const timeout = window.setTimeout(onClose, 2000);

    return () => {
      window.clearTimeout(timeout);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [onClose, type]);

  return (
    <div
      role="status"
      className={`fixed right-4 top-4 z-[100] flex max-w-sm items-center gap-3 rounded-xl px-5 py-4 text-sm font-semibold text-white shadow-xl ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      <span>{type === "success" ? "✓" : "!"}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-lg leading-none opacity-80 hover:opacity-100"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
