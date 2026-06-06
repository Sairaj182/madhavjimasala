import Image from "next/image";
import { JOURNEY_STEPS } from "@/lib/constants";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export default function JourneySection() {
  return (
    <section className="py-20 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-brand-dark sm:text-4xl">
              The Journey of Flavor
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-brand-gray">
              From sun-kissed farms to your kitchen — every Madhavji Masala spice
              travels a meticulous journey of quality and care.
            </p>
          </div>
        </ScrollReveal>

        {/* Journey Steps */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {JOURNEY_STEPS.map((step, index) => (
            <ScrollReveal 
              key={step.id} 
              animation="fade-up" 
              delay={`delay-${index * 100}`}
            >
              <div className="group relative">
                {/* Connector Line (desktop) */}
                {index < JOURNEY_STEPS.length - 1 && (
                  <div className="absolute right-0 top-1/3 hidden h-[2px] w-6 bg-brand-border lg:block" style={{ right: "-12px" }} />
                )}

                {/* Card */}
                <div className="overflow-hidden rounded-2xl bg-brand-cream transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {/* Step Number */}
                    <div className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-maroon text-xs font-bold text-white">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-heading text-lg font-bold text-brand-dark">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-gray">
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
