"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallPwa() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setInstalled(standalone);
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const install = async () => {
    if (!installPrompt) {
      setMessage(isIos
        ? "On your iPhone or iPad, tap Share, then Add to Home Screen."
        : "Use your browser menu and choose Install app or Add to Home screen.");
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setMessage(choice.outcome === "accepted" ? "The app is being added to your device." : "Installation was cancelled.");
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl border border-brand-border bg-white px-6 py-10 text-center shadow-sm sm:px-12">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-brand-cream p-3">
          <img src="/images/madhavjimasala_logo_tbg.png" alt="Madhavji Masala" className="h-full w-full object-contain" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-gold">Madhavji Masala</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-brand-dark sm:text-4xl">Install our app</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-brand-gray sm:text-base">
          Keep Madhavji Masala one tap away for products, orders, and pickup updates.
        </p>

        {installed ? (
          <p className="mt-8 rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
            Madhavji Masala is already installed on this device.
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void install()}
              className="mt-8 inline-flex items-center justify-center bg-brand-maroon px-7 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-brand-maroon-dark"
            >
              Install the app
            </button>
            <p className="mt-4 text-xs text-brand-gray">
              {isIos ? "iPhone/iPad: Share → Add to Home Screen" : "If no prompt appears, use your browser menu → Install app."}
            </p>
          </>
        )}

        {message && <p className="mt-4 text-sm text-brand-gray">{message}</p>}

        <div className="mt-10 border-t border-brand-border pt-6 text-left">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-dark">Manual installation</h2>
          {isIos ? (
            <div className="mt-4 space-y-3 text-sm leading-6 text-brand-gray">
              <p><span className="font-bold text-brand-maroon">1.</span> Safariમાં આ પેજ ખોલો: <span className="font-semibold text-brand-dark">madhavji.sairajraithatha.me/install</span></p>
              <p><span className="font-bold text-brand-maroon">2.</span> નીચેનું <span className="font-semibold text-brand-dark">Share</span> બટન દબાવો.</p>
              <p><span className="font-bold text-brand-maroon">3.</span> <span className="font-semibold text-brand-dark">Add to Home Screen</span> પસંદ કરો, પછી <span className="font-semibold text-brand-dark">Open as Web App</span> ચાલુ કરીને <span className="font-semibold text-brand-dark">Add</span> દબાવો.</p>
              <p className="border-l-2 border-brand-gold pl-3">On iPhone/iPad: Open this link in Safari → tap Share → Add to Home Screen → turn on Open as Web App → Add.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3 text-sm leading-6 text-brand-gray">
              <p><span className="font-bold text-brand-maroon">1.</span> Chrome અથવા Edgeમાં આ પેજ ખોલો.</p>
              <p><span className="font-bold text-brand-maroon">2.</span> સરનામાંની બાજુમાં <span className="font-semibold text-brand-dark">Install</span> આઇકન દેખાય તો તેને દબાવો.</p>
              <p><span className="font-bold text-brand-maroon">3.</span> આઇકન ન દેખાય તો browser menu <span className="font-semibold text-brand-dark">⋮</span> ખોલો → <span className="font-semibold text-brand-dark">Install Madhavji Masala</span> અથવા <span className="font-semibold text-brand-dark">Add to Home screen</span> પસંદ કરો.</p>
              <p className="border-l-2 border-brand-gold pl-3">On Android: Chromeમાં લિંક ખોલો → menu ⋮ → Install app અથવા Add to Home screen → Install.</p>
              <p className="border-l-2 border-brand-gold pl-3">Desktop પર: Chrome/Edgeમાં લિંક ખોલો → Install icon અથવા menu → Install Madhavji Masala → Install.</p>
            </div>
          )}
        </div>

        <p className="mt-6 text-xs text-brand-gray">
          Gujarati: એપ ઇન્સ્ટોલ કરવા માટે browserની મંજૂરી જરૂરી છે; વેબસાઇટ પોતે જ એપ ઇન્સ્ટોલ કરી શકતી નથી.
        </p>
      </div>
    </section>
  );
}
