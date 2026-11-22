import Image from "next/image";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const HOME_PROCESS_STEPS = [
  {
    id: "grinding",
    title: "Grinding",
    description: "Our state-of-the-art grinding ensures maximum flavor preservation and aroma in every spice.",
    image: "/images/process/grinding.png",
  },
  {
    id: "blending",
    title: "Blending",
    description: "Our master blenders combine generations of expertise with precision-ground spices to create authentic, consistent blends.",
    image: "/images/process/blending.png",
  },
  {
    id: "sifting",
    title: "Vibro Sifting",
    description: "Our Vibro Sifting process ensures the perfect consistency and texture in every batch, free from lumps or impurities.",
    image: "/images/process/vibro-sifter.png",
  },
  {
    id: "packaging",
    title: "Packaging",
    description: "Sealed fresh in airtight packaging to preserve aroma, flavor, and potency.",
    image: "/images/process/packaging.png",
  },
];

export default function JourneySection() {
  return (
    <section className="relative overflow-hidden bg-brand-cream py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <span className="section-eyebrow">From Farm to Kitchen</span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-brand-dark sm:text-4xl lg:text-5xl">
              The Journey of <span className="text-brand-gold">Flavor</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-brand-gray">
              From sun-kissed farms to your kitchen — every Madhavji Masala spice travels a meticulous journey of quality and care.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2" aria-hidden="true">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-brand-gold/60" />
              <div className="h-1.5 w-1.5 rotate-45 bg-brand-gold/50" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-brand-gold/60" />
            </div>
          </div>
        </ScrollReveal>

        <div className="relative mt-12 grid grid-cols-2 gap-3 sm:gap-6 lg:mt-16 lg:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-[calc(33%+0.5rem)] z-0 hidden border-t-2 border-dashed border-brand-gold/25 lg:block" aria-hidden="true" />
          {HOME_PROCESS_STEPS.map((step, index) => (
            <ScrollReveal key={step.id} animation="fade-up" delay={`delay-${index * 100}`} className="relative z-10 h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-border/50 bg-white transition-all duration-400 hover:-translate-y-2 hover:border-brand-gold/30 hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)]">
                <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-brand-cream">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-maroon text-xs font-bold text-white ring-2 ring-brand-gold/40 ring-offset-1 ring-offset-black/20 shadow-lg">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-3 sm:p-5">
                  <h3 className="font-heading text-sm font-bold text-brand-dark sm:text-lg">{step.title}</h3>
                  <p className="mt-1 text-[11px] leading-5 text-brand-gray sm:mt-2 sm:text-sm sm:leading-relaxed">{step.description}</p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
