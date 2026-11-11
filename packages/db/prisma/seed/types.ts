// ─────────────────────────────────────────────
// Madhavji Masala — Shared Types
// All site content interfaces for Phase 1
// These will later map to Prisma models
// ─────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
}

export interface SiteInfo {
  name: string;
  tagline: string;
  description: string;
  foundedYear: number;
  logoPath: string;
  logoAlt: string;
}

export interface ContactInfo {
  corporateOffice: {
    label: string;
    address: string[];
  };
  productionFacility: {
    label: string;
    address: string[];
  };
  phones: string[];
  emails: string[];
  whatsapp: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface HeroContent {
  badge: string;
  headline: string;
  subheadline: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  backgroundImage: string;
}

export interface PackagingSize {
  label: string;
  weight: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  shortDescription: string;
  price: number;
  priceUnit: string;
  images: string[];
  packagingSizes: PackagingSize[];
  tags: string[];
  usageTips: string[];
  perfectFor: string[];
  origin: string;
  originDescription: string;
  isFeatured: boolean;
  badges: string[];
}

export interface ProductCategory {
  label: string;
  slug: string;
}

export interface Certification {
  id: string;
  name: string;
  description: string;
  icon: string;
  image?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  company?: string;
  quote: string;
  avatar?: string;
  rating: number;
}

export interface ProcessStep {
  id: string;
  number: string;
  title: string;
  description: string;
  image: string;
}

export interface JourneyStep {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface TrustFactor {
  id: string;
  icon: string;
  title: string;
  description: string;
  stat?: string;
}

export interface AboutContent {
  heritage: {
    headline: string;
    highlightedText: string;
    story: string[];
    image: string;
  };
  vision: {
    title: string;
    description: string;
    highlights: string[];
  };
  mission: {
    title: string;
    description: string;
    highlights: string[];
  };
  facility: {
    headline: string;
    subtitle: string;
  };
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface PageMeta {
  title: string;
  description: string;
  keywords?: string[];
}
