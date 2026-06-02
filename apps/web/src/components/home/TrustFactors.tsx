import { TRUST_FACTORS } from "@/lib/constants";

export default function TrustFactors() {
  return (
    <section className="bg-brand-cream py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_FACTORS.map((factor) => (
            <div
              key={factor.id}
              className="group relative rounded-2xl bg-white p-8 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-cream text-brand-maroon transition-colors duration-300 group-hover:bg-brand-maroon group-hover:text-white">
                <TrustIcon name={factor.icon} />
              </div>

              {/* Stat Badge */}
              {factor.stat && (
                <span className="mt-4 inline-block rounded-full bg-brand-gold/10 px-3 py-1 text-xs font-bold text-brand-gold">
                  {factor.stat}
                </span>
              )}

              {/* Title & Description */}
              <h3 className="mt-3 font-heading text-lg font-bold text-brand-dark">
                {factor.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-gray">
                {factor.description}
              </p>
            </div>
          ))}
        </div>

        {/* Central tagline */}
        <div className="mt-16 text-center">
          <h2 className="font-heading text-3xl font-bold text-brand-dark sm:text-4xl">
            Why the world trusts{" "}
            <span className="text-brand-maroon">Madhavji Masala.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-brand-gray">
            For over four decades, we&apos;ve been the trusted spice partner for
            homes, restaurants, and businesses worldwide. Our commitment to
            purity isn&apos;t just a promise — it&apos;s our legacy.
          </p>
        </div>
      </div>
    </section>
  );
}

function TrustIcon({ name }: { name: string }) {
  const iconClass = "h-6 w-6";
  switch (name) {
    case "shield-check":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      );
    case "beaker":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      );
    case "globe":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      );
    case "leaf":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      );
    default:
      return null;
  }
}
