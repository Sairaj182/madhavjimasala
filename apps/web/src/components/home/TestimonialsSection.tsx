import { TESTIMONIALS } from "@/lib/constants";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export default function TestimonialsSection() {
  return (
    <section className="bg-brand-cream py-20 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-brand-dark sm:text-4xl">
              Trusted by Culinary Experts
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-brand-gray">
              From Michelin-star kitchens to family homes, here&apos;s what our
              partners say about the Madhavji Masala difference.
            </p>
          </div>
        </ScrollReveal>

        {/* Testimonial Cards */}
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <ScrollReveal 
              key={testimonial.id} 
              animation="fade-up" 
              delay={`delay-${index * 100}`}
              className="h-full"
            >
              <div className="group relative rounded-2xl bg-white p-8 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 h-full flex flex-col">
                {/* Quote Mark */}
                <div className="absolute -top-3 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-brand-maroon text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
                  </svg>
                </div>

                {/* Stars */}
                <div className="mt-4 flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="mt-4 text-sm leading-relaxed text-brand-dark/80 italic flex-grow">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3 border-t border-brand-border pt-4">
                  {/* Avatar circle */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cream text-sm font-bold text-brand-maroon">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-dark">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-brand-gray">
                      {testimonial.title}
                      {testimonial.company && `, ${testimonial.company}`}
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
