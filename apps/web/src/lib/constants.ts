// ─────────────────────────────────────────────
// Madhavji Masala — Site Constants
// Single source of truth for ALL site content.
// Future: Admin panel will manage DB, web app
// will fetch from DB instead of this file.
// ─────────────────────────────────────────────

import type {
  SiteInfo,
  ContactInfo,
  SocialLink,
  NavLink,
  HeroContent,
  Product,
  ProductCategory,
  Certification,
  Testimonial,
  ProcessStep,
  JourneyStep,
  TrustFactor,
  AboutContent,
  FooterColumn,
  PageMeta,
} from "./types";

// ── Brand Info ───────────────────────────────

export const SITE_INFO: SiteInfo = {
  name: "Madhavji Masala",
  tagline: "Pure Spices. Authentic Taste.",
  description:
    "Crafting the finest aromatic spices with heritage techniques and modern quality standards since 1982.",
  foundedYear: 1982,
  logoPath: "/images/logo.png",
  logoAlt: "Madhavji Masala Logo",
};

// ── Navigation ───────────────────────────────

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "Certifications", href: "/certifications" },
  { label: "Contact", href: "/contact" },
];

// ── Contact ──────────────────────────────────

export const CONTACT_INFO: ContactInfo = {
  corporateOffice: {
    label: "Corporate Office",
    address: [
      "402, The Spice Plaza",
      "Near Navrangpura, Ahmedabad",
      "Gujarat 380009",
    ],
  },
  productionFacility: {
    label: "Production Facility",
    address: [
      "Plot No. F-287, Industrial Estate",
      "Unjha, Gujarat 384170",
    ],
  },
  phones: ["+91 79 4050 8177", "+91 98250 41234"],
  emails: ["info@madhavjimasala.com", "sales@madhavjimasala.com"],
  whatsapp: "+919825041234",
};

// ── Social Links ─────────────────────────────

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: "Instagram", url: "https://instagram.com/madhavjimasala", icon: "instagram" },
  { platform: "Facebook", url: "https://facebook.com/madhavjimasala", icon: "facebook" },
  { platform: "LinkedIn", url: "https://linkedin.com/company/madhavjimasala", icon: "linkedin" },
  { platform: "Twitter", url: "https://twitter.com/madhavjimasala", icon: "twitter" },
];

// ── Hero ─────────────────────────────────────

export const HERO_CONTENT: HeroContent = {
  badge: "PREMIUM SPICE COLLECTION",
  headline: "Pure Spices.\nAuthentic Taste.",
  subheadline:
    "Tradition's purest craft—our signature spice blends are a gift of authentic flavors, cultivated with care and love.",
  description:
    "From the fertile lands of Gujarat to kitchens worldwide, Madhavji Masala delivers purity in every pinch.",
  primaryCta: { label: "Our Products", href: "/products" },
  secondaryCta: { label: "Know Our Story", href: "/about" },
  backgroundImage: "/images/hero/hero-banner.png",
};

// ── Product Categories ───────────────────────

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { label: "All Collections", slug: "all" },
  { label: "Whole Spices", slug: "whole-spices" },
  { label: "Ground Spices", slug: "ground-spices" },
  { label: "Signature Blends", slug: "signature-blends" },
];

// ── Products ─────────────────────────────────

export const PRODUCTS: Product[] = [
  {
    id: "prod-001",
    slug: "salem-turmeric",
    name: "Salem Turmeric",
    category: "Ground Spices",
    categorySlug: "ground-spices",
    description:
      "Our Salem Turmeric is sourced from the renowned turmeric farms of Tamil Nadu's Salem district. Known for its exceptionally high curcumin content and deep golden hue, this turmeric delivers both vibrant color and potent health benefits. Stone-ground to preserve its natural oils and aroma, it's the cornerstone of authentic Indian cooking.",
    shortDescription:
      "A single-origin turmeric prized for its high curcumin content and deep golden color, sourced from Salem farms.",
    price: 120,
    priceUnit: "100g",
    images: ["/images/products/turmeric.png"],
    packagingSizes: [
      { label: "100g Pouch", weight: "100g" },
      { label: "250g Jar", weight: "250g" },
      { label: "500g Bulk", weight: "500g" },
    ],
    tags: ["Organic", "Single Origin", "High Curcumin"],
    usageTips: [
      "Apply lightly as a dry paste or mix into warm aromatic base for rich golden coloring.",
      "Use in marinades like 'Tandoori haldi' to achieve a deep naturally dried coffee-like, distinct haldi aroma.",
      "Prepare a turmeric milk (haldi doodh) with honey and ginger for a soothing wellness drink.",
    ],
    perfectFor: ["Curry", "Kadai", "Pulao", "Milk"],
    origin: "Salem, Tamil Nadu",
    originDescription:
      "Sourced directly from the rich valleys of Salem, Tamil Nadu. Every batch is lab-tested for curcumin content, naturally dried, and stone-ground to preserve natural oils.",
    isFeatured: true,
    badges: ["100% Organic", "Lab Tested", "No Colors"],
  },
  {
    id: "prod-002",
    slug: "kashmiri-red-chilli",
    name: "Kashmiri Red Chilli",
    category: "Ground Spices",
    categorySlug: "ground-spices",
    description:
      "Renowned for its vibrant crimson hue and mild, smoky heat. Our Kashmiri chilies are sun-dried and stone-ground to ensure the perfect balance of color and flavor that defines authentic Indian cuisine. The unique capsaicin profile provides rich color without overwhelming heat.",
    shortDescription:
      "Vibrant crimson chilli with a mild, smoky heat profile — perfect for color-rich curries and tandoori dishes.",
    price: 180,
    priceUnit: "100g",
    images: ["/images/products/red-chilli.png"],
    packagingSizes: [
      { label: "100g Pouch", weight: "100g" },
      { label: "250g Jar", weight: "250g" },
      { label: "500g Bulk", weight: "500g" },
    ],
    tags: ["Sun Dried", "Mild Heat", "Rich Color"],
    usageTips: [
      "Use generously for deep red color in gravies without adding excessive heat.",
      "Blend into tandoori marinades for authentic restaurant-quality color.",
      "Mix with oil for a vibrant tempering (tadka) base.",
    ],
    perfectFor: ["Tandoori", "Curry", "Biryani", "Chutneys"],
    origin: "Srinagar, Jammu & Kashmir",
    originDescription:
      "Sourced directly from the cold valleys of Srinagar, Jammu & Kashmir. Each batch is sun-dried at high altitudes, creating a unique sun-dried capsaicin profile.",
    isFeatured: true,
    badges: ["100% Organic", "Lab Tested", "No Colors"],
  },
  {
    id: "prod-003",
    slug: "royal-garam-masala",
    name: "Royal Garam Masala",
    category: "Signature Blends",
    categorySlug: "signature-blends",
    description:
      "A regal blend of 12 hand-selected whole spices, roasted to perfection and ground fresh. Our signature Garam Masala features premium cardamom, Malabar black pepper, Sri Lankan cinnamon, and stone flower — delivering complex warmth that transforms any dish into a culinary masterpiece.",
    shortDescription:
      "A regal 12-spice blend with premium cardamom, Malabar pepper, and cinnamon — our signature warmth.",
    price: 250,
    priceUnit: "100g",
    images: ["/images/products/garam-masala.png"],
    packagingSizes: [
      { label: "100g Pouch", weight: "100g" },
      { label: "250g Jar", weight: "250g" },
      { label: "500g Bulk", weight: "500g" },
    ],
    tags: ["Signature Blend", "12 Spices", "Fresh Ground"],
    usageTips: [
      "Add at the end of cooking for maximum aroma release.",
      "Sprinkle over dal, curries, and rice dishes just before serving.",
      "Use sparingly — a little goes a long way with this potent blend.",
    ],
    perfectFor: ["Curry", "Dal", "Biryani", "Kebabs"],
    origin: "Multi-Origin Blend",
    originDescription:
      "Each ingredient sourced from its finest origin — cardamom from Kerala, pepper from Tellicherry, cinnamon from Sri Lanka. Blended and ground fresh in small batches.",
    isFeatured: true,
    badges: ["Signature Blend", "Small Batch", "No Preservatives"],
  },
  {
    id: "prod-004",
    slug: "alleppey-cardamom",
    name: "Alleppey Cardamom",
    category: "Whole Spices",
    categorySlug: "whole-spices",
    description:
      "Bright green pods with a single-origin intensely aromatic profile. Our Alleppey Green Cardamom is hand-picked from the misty hills of Kerala and carefully dried to preserve the potent essential oils within. Known as the 'Queen of Spices', each pod bursts with complex floral, citrusy, and slightly sweet notes.",
    shortDescription:
      "Hand-picked green pods from Kerala with an intensely floral, citrusy aroma — the Queen of Spices.",
    price: 480,
    priceUnit: "100g",
    images: ["/images/products/cardamom.png"],
    packagingSizes: [
      { label: "50g Pouch", weight: "50g" },
      { label: "100g Jar", weight: "100g" },
      { label: "250g Bulk", weight: "250g" },
    ],
    tags: ["Single Origin", "Hand Picked", "Whole Pods"],
    usageTips: [
      "Crush pods lightly before adding to rice dishes for subtle aroma.",
      "Add whole pods to chai tea for authentic Indian masala chai.",
      "Use ground seeds in desserts like kheer and gulab jamun.",
    ],
    perfectFor: ["Chai", "Biryani", "Desserts", "Pulao"],
    origin: "Alleppey, Kerala",
    originDescription:
      "Hand-picked from the misty Cardamom Hills of Alleppey, Kerala. Grade-A pods selected for size, color, and oil content. Naturally dried to preserve essential oils.",
    isFeatured: true,
    badges: ["Grade A", "Hand Picked", "Single Origin"],
  },
  {
    id: "prod-005",
    slug: "coriander-powder",
    name: "Coriander Powder",
    category: "Ground Spices",
    categorySlug: "ground-spices",
    description:
      "The essential foundation of every Indian curry. Our coriander is sourced from the finest farms of Rajasthan and Madhya Pradesh, slow-roasted to deepen the nutty citrus notes, then stone-ground to a fine, aromatic powder. A versatile spice that forms the backbone of most Indian spice blends.",
    shortDescription:
      "Fine-ground coriander with deep citrus notes, roasted and stone-ground from Rajasthan's finest harvest.",
    price: 85,
    priceUnit: "100g",
    images: ["/images/products/coriander.png"],
    packagingSizes: [
      { label: "100g Pouch", weight: "100g" },
      { label: "250g Jar", weight: "250g" },
      { label: "500g Bulk", weight: "500g" },
    ],
    tags: ["Stone Ground", "Slow Roasted", "Pure"],
    usageTips: [
      "Toast lightly in a dry pan before adding to gravies for deeper flavor.",
      "Mix with cumin powder for the classic dhania-jeera base of Indian curries.",
      "Blend into chutneys and marinades for a fresh citrusy undertone.",
    ],
    perfectFor: ["Curry Base", "Chutneys", "Marinades", "Sabzi"],
    origin: "Kota, Rajasthan",
    originDescription:
      "Sourced from the arid plains of Rajasthan and Madhya Pradesh. Sun-dried coriander seeds are slow-roasted and stone-ground to preserve essential oils and citrus aroma.",
    isFeatured: false,
    badges: ["100% Natural", "Stone Ground", "No Additives"],
  },
  {
    id: "prod-006",
    slug: "tellicherry-peppercorns",
    name: "Tellicherry Peppercorns",
    category: "Whole Spices",
    categorySlug: "whole-spices",
    description:
      "Bold peppercorns from Kerala's Tellicherry coast — the world's most prized pepper origin. These extra-large berries are left on the vine longer than standard peppercorns, developing complex layers of heat, fruitiness, and woody depth. The 'King of Spices' at its absolute finest.",
    shortDescription:
      "King of peppercorns. Extra-large Tellicherry berries with complex heat, fruity depth, and woody notes.",
    price: 210,
    priceUnit: "100g",
    images: ["/images/products/peppercorn.png"],
    packagingSizes: [
      { label: "50g Pouch", weight: "50g" },
      { label: "100g Jar", weight: "100g" },
      { label: "250g Bulk", weight: "250g" },
    ],
    tags: ["Extra Large", "Vine Ripened", "Premium Grade"],
    usageTips: [
      "Crack fresh over steaks, salads, and grilled vegetables for bold heat.",
      "Add whole to stocks, broths, and biryanis during slow cooking.",
      "Toast lightly and grind fresh for the most aromatic pepper experience.",
    ],
    perfectFor: ["Steaks", "Biryani", "Soups", "Salads"],
    origin: "Tellicherry, Kerala",
    originDescription:
      "From the Malabar coast of Tellicherry, Kerala — the world's most prized pepper origin. Vine-ripened to extra-large size for maximum flavor complexity.",
    isFeatured: false,
    badges: ["Premium Grade", "Vine Ripened", "Single Origin"],
  },
  {
    id: "prod-007",
    slug: "unprocessed-jeera",
    name: "Unprocessed Jeera",
    category: "Whole Spices",
    categorySlug: "whole-spices",
    description:
      "Pure, bold, and untreated cumin seeds with high essential oil content. Our jeera is sourced from Gujarat's finest cumin-growing regions and left unprocessed to preserve the earthy, warm, and slightly nutty flavor profile that makes it indispensable in Indian cooking.",
    shortDescription:
      "Pure, bold cumin seeds with high oil content — unprocessed and untreated for maximum earthiness.",
    price: 95,
    priceUnit: "100g",
    images: ["/images/products/jeera.png"],
    packagingSizes: [
      { label: "100g Pouch", weight: "100g" },
      { label: "250g Jar", weight: "250g" },
      { label: "500g Bulk", weight: "500g" },
    ],
    tags: ["Unprocessed", "High Oil Content", "Pure"],
    usageTips: [
      "Temper in hot oil or ghee until they crackle for the perfect tadka.",
      "Dry roast and grind fresh for homemade jeera powder.",
      "Add whole to rice while cooking for fragrant jeera rice.",
    ],
    perfectFor: ["Tadka", "Rice", "Dal", "Raita"],
    origin: "Unjha, Gujarat",
    originDescription:
      "From the cumin capital of India — Unjha, Gujarat. Our jeera is carefully sorted, cleaned, and packed without any chemical processing to retain its natural essential oils.",
    isFeatured: false,
    badges: ["Unprocessed", "Chemical Free", "Farm Fresh"],
  },
  {
    id: "prod-008",
    slug: "grade-a-saffron",
    name: "Grade-A Saffron",
    category: "Whole Spices",
    categorySlug: "whole-spices",
    description:
      "The world's most precious spice — our Grade-A Kashmiri Saffron (Kesar) is hand-harvested from the high-altitude crocus fields of Pampore, Kashmir. Each strand is individually selected for color, aroma, and crocin content. A few threads transform any dish with its exotic golden color and intoxicating floral aroma.",
    shortDescription:
      "Hand-harvested Kashmiri kesar from Pampore. The world's finest saffron — pure, potent, and precious.",
    price: 850,
    priceUnit: "1g",
    images: ["/images/products/saffron.png"],
    packagingSizes: [
      { label: "1g Vial", weight: "1g" },
      { label: "2g Vial", weight: "2g" },
      { label: "5g Box", weight: "5g" },
    ],
    tags: ["Grade A", "Hand Harvested", "Kashmir Origin"],
    usageTips: [
      "Soak a few strands in warm milk for 15 minutes before adding to biryani or desserts.",
      "Add to kheer, phirni, and rabri for authentic golden color and floral aroma.",
      "Dissolve in warm water and add to rice for luxurious saffron pulao.",
    ],
    perfectFor: ["Biryani", "Kheer", "Pulao", "Desserts"],
    origin: "Pampore, Kashmir",
    originDescription:
      "Hand-harvested from the high-altitude crocus fields of Pampore, Kashmir. Each strand is individually selected for crocin content, aroma, and color purity. Pure, unadulterated Kashmir kesar.",
    isFeatured: false,
    badges: ["Grade A", "Hand Harvested", "Lab Certified"],
  },
];

// ── Trust Factors ────────────────────────────

export const TRUST_FACTORS: TrustFactor[] = [
  {
    id: "tf-1",
    icon: "shield-check",
    title: "Quality Certified",
    description: "Every batch is lab-tested and certified for purity, potency, and food safety standards.",
    stat: "ISO 22000",
  },
  {
    id: "tf-2",
    icon: "beaker",
    title: "Expert Blending",
    description: "Our master blenders bring decades of experience to create perfectly balanced spice profiles.",
    stat: "40+ Years",
  },
  {
    id: "tf-3",
    icon: "globe",
    title: "Global Export",
    description: "Trusted by businesses across 15+ countries for consistent quality and reliable supply.",
    stat: "15+ Countries",
  },
  {
    id: "tf-4",
    icon: "leaf",
    title: "Pure & Natural",
    description: "No artificial colors, no preservatives, no fillers. Just pure spices, the way nature intended.",
    stat: "100% Pure",
  },
];

// ── Journey Steps ────────────────────────────

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: "js-1",
    title: "Sourcing",
    description: "Hand-picked from trusted farms across India's finest spice-growing regions.",
    image: "/images/process/sourcing.png",
  },
  {
    id: "js-2",
    title: "Processing",
    description: "Cleaned, sorted, and processed using state-of-the-art cryogenic grinding technology.",
    image: "/images/process/grinding.png",
  },
  {
    id: "js-3",
    title: "Blending",
    description: "Master blenders craft perfect flavor profiles using time-tested recipes.",
    image: "/images/hero/hero-banner.png",
  },
  {
    id: "js-4",
    title: "Packaging",
    description: "Sealed fresh in airtight packaging to preserve aroma, flavor, and potency.",
    image: "/images/process/packaging.png",
  },
];

// ── Process Steps (About Page) ───────────────

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: "ps-1",
    number: "01",
    title: "Ethical Selection",
    description:
      "We source our raw spices directly from trusted Indian farmers, paying fair-trade prices transparently and building long-term partnerships that ensure both quality and sustainability.",
    image: "/images/process/sourcing.png",
  },
  {
    id: "ps-2",
    number: "02",
    title: "Cryogenic Grinding",
    description:
      "Our cold-grinding technology ensures spice oils are preserved. Unlike conventional heat-producing methods, cryogenic grinding retains the full aromatic, color, and flavor profile of every spice.",
    image: "/images/process/grinding.png",
  },
  {
    id: "ps-3",
    number: "03",
    title: "Micro-Batch Testing",
    description:
      "Every batch undergoes 24-layer quality checks for potency, safety and purity. Lab-certified by independent third parties, each batch meets the strictest food safety and quality standards.",
    image: "/images/process/testing.png",
  },
];

// ── Testimonials ─────────────────────────────

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    name: "Chef Rajesh Khanna",
    title: "Executive Chef",
    company: "The Oberoi, Mumbai",
    quote:
      "In 20 years of professional cooking, I've never found spices this consistently pure. Madhavji's turmeric has a curcumin richness that transforms every dish. This is what authentic Indian cooking demands.",
    rating: 5,
  },
  {
    id: "test-2",
    name: "Priya Mehta",
    title: "Founder",
    company: "Spice Route Exports",
    quote:
      "We've been sourcing from Madhavji Masala for our international clients for over 8 years. Their quality consistency is unmatched — every shipment meets our strict export standards without exception.",
    rating: 5,
  },
  {
    id: "test-3",
    name: "Amit Patel",
    title: "Restaurant Owner",
    company: "Gujarati Thali House",
    quote:
      "Switching to Madhavji Masala was the best decision for our restaurant chain. The flavor profiles are so consistent that our dishes taste exactly the same across all 12 locations.",
    rating: 5,
  },
];

// ── About Content ────────────────────────────

export const ABOUT_CONTENT: AboutContent = {
  heritage: {
    headline: "A Legacy Sculpted by",
    highlightedText: "Saffron & Soil",
    story: [
      "Since our inception, Madhavji Masala has been more than a brand — it is a custodian of India's culinary soul. We began as a small apothecary of flavor, dedicated to preserving the ancient art that makes a meal a memory.",
      "Founded in 1982 by Pankaj Madhavji in the heart of Gujarat's spice country, we've grown from a humble grinding mill to one of the region's most trusted spice houses — without ever compromising on the principles that started it all.",
      "Today, three generations of the Madhavji family continue this legacy, combining time-honored techniques with modern quality standards to deliver spices that honor tradition while meeting the demands of contemporary kitchens worldwide.",
    ],
    image: "/images/about/heritage.png",
  },
  vision: {
    title: "Our Global Vision",
    description:
      "To redefine the global standard of purity in the spice industry, ensuring that every household — regardless of geography — can access the authentic, potent heart of traditional seasonings without compromise.",
    highlights: ["100+ Products & Forms", "Sustainable Cold Grinding"],
  },
  mission: {
    title: "Our Mission",
    description:
      "Through ethical sourcing, artisanal processing, and rigorous scientific hygiene, we bridge the gap between ancient tradition and modern manufacturing excellence.",
    highlights: ["FSSAI Certified", "ISO 22000 Compliant"],
  },
  facility: {
    headline: "The Modern Apothecary",
    subtitle:
      "Where tradition meets technology. Explore our state-of-the-art facility designed for absolute hygiene, precision, and flavor preservation.",
  },
};

// ── Certifications ───────────────────────────

export const CERTIFICATIONS: Certification[] = [
  {
    id: "cert-1",
    name: "FSSAI Certified",
    description:
      "Licensed by the Food Safety and Standards Authority of India. Every product meets the stringent food safety requirements mandated for Indian food manufacturers.",
    icon: "shield",
  },
  {
    id: "cert-2",
    name: "ISO 22000:2018",
    description:
      "Our production facility is ISO 22000:2018 certified, ensuring a comprehensive food safety management system from sourcing to packaging.",
    icon: "award",
  },
  {
    id: "cert-3",
    name: "AGMARK Graded",
    description:
      "Selected products carry the AGMARK certification — India's quality certification for agricultural products, guaranteeing grade and purity.",
    icon: "check-circle",
  },
  {
    id: "cert-4",
    name: "GMP Certified",
    description:
      "Our manufacturing processes follow Good Manufacturing Practices, ensuring consistent quality, hygiene, and safety across all production runs.",
    icon: "settings",
  },
  {
    id: "cert-5",
    name: "Spice Board of India",
    description:
      "Registered with the Spice Board of India as a licensed exporter, meeting all quality and compliance standards for international spice trade.",
    icon: "globe",
  },
  {
    id: "cert-6",
    name: "Lab Tested Purity",
    description:
      "Every batch undergoes independent third-party lab testing for heavy metals, pesticide residues, aflatoxins, and microbial contamination.",
    icon: "beaker",
  },
];

// ── Footer ───────────────────────────────────

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Collections",
    links: [
      { label: "Whole Spices", href: "/products?category=whole-spices" },
      { label: "Ground Spices", href: "/products?category=ground-spices" },
      { label: "Signature Blends", href: "/products?category=signature-blends" },
      { label: "Gift Sets", href: "/products" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Process", href: "/about#process" },
      { label: "Certifications", href: "/certifications" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Wholesale Portal", href: "/contact" },
      { label: "Shipping Info", href: "/contact" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

// ── Page Meta ────────────────────────────────

export const PAGE_META: Record<string, PageMeta> = {
  home: {
    title: "Madhavji Masala — Pure Spices. Authentic Taste.",
    description:
      "Premium Indian spices crafted with heritage techniques and modern quality standards. Explore our range of pure, lab-tested spices delivered from Gujarat to the world.",
    keywords: ["Indian spices", "pure masala", "Gujarat spices", "organic turmeric", "premium spice brand"],
  },
  products: {
    title: "Curated Spice Collections — Madhavji Masala",
    description:
      "Sourced from ancestral soils, processed with modern precision. Explore our range of artisanal masalas and single-origin spices.",
    keywords: ["spice collection", "buy Indian spices", "whole spices", "ground masala"],
  },
  about: {
    title: "Our Heritage — Madhavji Masala",
    description:
      "A legacy sculpted by saffron and soil. Discover the Madhavji Masala story — from a small grinding mill to one of Gujarat's most trusted spice houses.",
    keywords: ["about Madhavji Masala", "spice heritage", "Gujarat spice company"],
  },
  certifications: {
    title: "Certifications & Quality — Madhavji Masala",
    description:
      "FSSAI certified, ISO 22000 compliant, and lab-tested for purity. Explore the quality standards behind every Madhavji Masala product.",
    keywords: ["FSSAI certified spices", "ISO spice company", "quality certified masala"],
  },
  contact: {
    title: "Contact Us — Madhavji Masala",
    description:
      "Get in touch for wholesale inquiries, partnerships, or custom spice blending. Our team is ready to curate the perfect flavor profile for your business.",
    keywords: ["contact Madhavji Masala", "wholesale spices", "spice supplier India"],
  },
};
