"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { PRODUCTS, SITE_INFO, CONTACT_INFO } from "@/lib/constants";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailContent product={product} />;
}

function ProductDetailContent({
  product,
}: {
  product: (typeof PRODUCTS)[number];
}) {
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);

  const whatsappMessage = encodeURIComponent(
    `Hi! I'm interested in ${product.name} (${product.packagingSizes[selectedSize].label}) from ${SITE_INFO.name}. Please share more details.`
  );

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-brand-cream">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-brand-gray">
            <Link href="/products" className="hover:text-brand-maroon transition-colors">
              Products
            </Link>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <Link href={`/products?category=${product.categorySlug}`} className="hover:text-brand-maroon transition-colors">
              {product.category}
            </Link>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="font-medium text-brand-dark">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Hero */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-cream">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>

              {/* Thumbnail Strip */}
              {product.images.length > 1 && (
                <div className="mt-4 flex gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative aspect-square w-20 overflow-hidden rounded-xl transition-all ${
                        selectedImage === i
                          ? "ring-2 ring-brand-maroon ring-offset-2"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt={`${product.name} view ${i + 1}`} fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-cream px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-maroon">
                {product.category}
              </div>

              <h1 className="mt-4 font-heading text-3xl font-bold text-brand-dark sm:text-4xl lg:text-5xl">
                {product.name}
              </h1>

              <p className="mt-4 text-base leading-relaxed text-brand-gray">
                {product.description}
              </p>

              {/* Badges */}
              <div className="mt-6 flex flex-wrap gap-3">
                {product.badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-white px-4 py-2 text-xs font-medium text-brand-dark"
                  >
                    <svg className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {badge}
                  </span>
                ))}
              </div>

              {/* Packaging Sizes */}
              <div className="mt-8">
                <p className="text-sm font-semibold text-brand-dark">
                  Packaging Size
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {product.packagingSizes.map((size, i) => (
                    <button
                      key={size.weight}
                      onClick={() => setSelectedSize(i)}
                      className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                        selectedSize === i
                          ? "bg-brand-maroon text-white shadow-lg"
                          : "border border-brand-border bg-white text-brand-dark hover:border-brand-maroon hover:text-brand-maroon"
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-brand-gray">
                  Bulk / Commercial sizes available on request.
                </p>
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-maroon px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-maroon-dark hover:shadow-[0_8px_30px_rgba(139,26,26,0.4)]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Enquire Now
                </Link>
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#1ea952] hover:shadow-lg"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Order via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Culinary Guidance */}
      <section className="bg-brand-cream py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Usage Tips */}
            <div className="lg:col-span-3 rounded-2xl bg-white p-8 shadow-card">
              <h2 className="flex items-center gap-3 font-heading text-2xl font-bold text-brand-dark">
                <svg className="h-6 w-6 text-brand-maroon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Culinary Guidance
              </h2>

              <div className="mt-6 grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-brand-dark uppercase tracking-wider">
                    Usage Tips
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {product.usageTips.map((tip, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed text-brand-gray">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-cream text-[10px] font-bold text-brand-maroon">
                          {i + 1}
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-brand-dark uppercase tracking-wider">
                    Perfect For
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {product.perfectFor.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-brand-cream px-4 py-2 text-sm font-medium text-brand-dark"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Origin & Purity */}
            <div className="lg:col-span-2 rounded-2xl bg-brand-maroon p-8 text-white">
              <h2 className="font-heading text-2xl font-bold">
                Origin & Purity
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/80">
                {product.originDescription}
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="text-sm font-medium">{product.origin}</span>
                </div>
                {product.tags.map((tag) => (
                  <div key={tag} className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-sm font-medium">{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-3xl font-bold text-brand-dark">
                The{" "}
                <span className="text-brand-maroon">Madhavji Standard</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-brand-gray">
                Our spices are more than ingredients — they are a legacy. For
                three generations, we&apos;ve partnered with small-scale farmers
                who practice traditional agricultural methods. No chemical
                enhancers, no industrial shortcuts — just the pure, undiluted
                soul of Indian spices.
              </p>

              <div className="mt-6 flex items-center gap-4 rounded-xl bg-brand-cream p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-maroon text-white text-sm font-bold">
                  PM
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-dark">
                    Rasiklal Raithatha
                  </p>
                  <p className="text-xs text-brand-gold font-medium">
                    Master Spice Curator
                  </p>
                </div>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/images/hero/hero-banner.png"
                alt="Madhavji Masala quality spices"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
