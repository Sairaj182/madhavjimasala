"use client";

export default function Error({ reset }: { reset: () => void }) {
  return <main className="flex min-h-[60vh] items-center justify-center bg-brand-cream/30 px-4"><div className="max-w-md rounded-2xl border border-brand-border bg-white p-8 text-center"><h1 className="font-heading text-2xl font-bold text-brand-dark">Storefront unavailable</h1><p className="mt-2 text-sm text-brand-gray">We could not load the store right now. Please try again.</p><button onClick={reset} className="mt-6 rounded-full bg-brand-maroon px-6 py-3 text-sm font-semibold text-white">Retry</button></div></main>;
}
