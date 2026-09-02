import Image from "next/image";
import { JOURNEY_STEPS } from "@/lib/constants";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export default function JourneySection() {
  return (
    <section className="py-20 lg:py-28 overflow-hidden relative" style={{ background: "linear-gradient(180deg, #ffffff 0%, #FAF6F0 30%, #FAF6F0 70%, #ffffff 100%)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <span className="section-eyebrow">From Farm to Kitchen</span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-brand-dark sm:text-4xl lg:text-5xl">
              The Journey of <span className="text-brand-gold">Flavor</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-brand-gray">
              From sun-kissed farms to your kitchen — every Madhavji Masala spice
              travels a meticulous journey of quality and care.
            </p>
            {/* Decorative underline */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-brand-gold/60" />
              <div className="h-1.5 w-1.5 rotate-45 bg-brand-gold/50" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-brand-gold/60" />
            </div>
          </div>
        </ScrollReveal>

        {/* Journey Steps */}
        <div className="mt-16 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 relative">
          {/* Desktop connector line across all cards */}
          <div className="absolute top-[calc(33%+0.5rem)] left-[12%] right-[12%] hidden lg:block h-px border-t-2 border-dashed border-brand-gold/25 z-0" />

          {JOURNEY_STEPS.map((step, index) => (
            <ScrollReveal
              key={step.id}
              animation="fade-up"
              delay={`delay-${index * 100}`}
              className="h-full"
            >
              <div className="group relative h-full z-10">
                {/* Card */}
                <div className="flex flex-col h-full overflow-hidden rounded-2xl bg-white border border-brand-border/50 transition-all duration-400 hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] hover:border-brand-gold/30 hover:-translate-y-2">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden shrink-0">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    {/* Step Number — upgraded */}
                    <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-brand-maroon text-[10px] sm:text-xs font-bold text-white ring-2 ring-brand-gold/40 ring-offset-1 ring-offset-black/20 shadow-lg">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-grow p-3 sm:p-5">
                    <h3 className="font-heading text-sm sm:text-lg font-bold text-brand-dark">
                      {step.title}
                    </h3>
                    <p className="mt-1 sm:mt-2 text-[10px] sm:text-sm leading-relaxed text-brand-gray line-clamp-3 sm:line-clamp-none">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
