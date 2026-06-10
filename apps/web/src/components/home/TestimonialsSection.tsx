"use client";

import { useState } from "react";
import { TESTIMONIALS } from "@/lib/constants";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export default function TestimonialsSection() {
  const [isPaused, setIsPaused] = useState(false);
  const [testimonialsList, setTestimonialsList] = useState(TESTIMONIALS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    company: "",
    quote: "",
    rating: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.quote) return;

    const newTestimonial = {
      id: Date.now().toString(),
      name: formData.name,
      title: formData.title || "Customer",
      company: formData.company,
      quote: formData.quote,
      rating: Number(formData.rating),
      image: "" // Add empty image if required by type
    };

    setTestimonialsList((prev) => [newTestimonial, ...prev]);
    setIsModalOpen(false);
    setFormData({ name: "", title: "", company: "", quote: "", rating: 5 });
  };

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

        {/* Testimonial Cards Marquee */}
        <ScrollReveal animation="fade-up" delay="delay-200">
          <div className="mt-14 relative w-full overflow-hidden">
            {/* Gradient fading edges for better visual effect */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-24 bg-gradient-to-r from-brand-cream to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-24 bg-gradient-to-l from-brand-cream to-transparent" />

            <div 
              className={`flex w-max gap-6 sm:gap-8 animate-[marquee_40s_linear_infinite] ${isPaused ? '[animation-play-state:paused]' : ''}`}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onClick={() => setIsPaused(!isPaused)}
            >
              {[...testimonialsList, ...testimonialsList].map((testimonial, index) => (
                <div key={`${testimonial.id}-${index}`} className="w-[300px] sm:w-[380px] shrink-0 py-2">
                  <div className="group relative rounded-2xl bg-white p-6 sm:p-8 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 h-full flex flex-col">
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
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-cream text-sm font-bold text-brand-maroon">
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
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Add Compliment Button */}
        <ScrollReveal animation="fade-up" delay="delay-300">
          <div className="mt-12 flex justify-center">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="rounded-full bg-brand-maroon px-8 py-3 font-semibold text-white transition-all hover:bg-brand-maroon-dark hover:scale-105 active:scale-95 shadow-md"
            >
              Add Compliment
            </button>
          </div>
        </ScrollReveal>
      </div>

      {/* Add Compliment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-2xl font-bold text-brand-dark">Share your experience</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-brand-gray hover:text-brand-dark"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Name *</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-lg border border-brand-border px-4 py-2 focus:border-brand-maroon focus:outline-none focus:ring-1 focus:ring-brand-maroon"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-1">Title (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full rounded-lg border border-brand-border px-4 py-2 focus:border-brand-maroon focus:outline-none focus:ring-1 focus:ring-brand-maroon"
                    placeholder="Chef / Home Cook"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-1">Rating</label>
                  <select 
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
                    className="w-full rounded-lg border border-brand-border px-4 py-2 focus:border-brand-maroon focus:outline-none focus:ring-1 focus:ring-brand-maroon"
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Your Compliment *</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.quote}
                  onChange={(e) => setFormData({...formData, quote: e.target.value})}
                  className="w-full rounded-lg border border-brand-border px-4 py-2 focus:border-brand-maroon focus:outline-none focus:ring-1 focus:ring-brand-maroon resize-none"
                  placeholder="Tell us what you love about our spices..."
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-4 rounded-xl bg-brand-maroon py-3 font-semibold text-white transition-all hover:bg-brand-maroon-dark active:scale-[0.98]"
              >
                Submit Compliment
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
