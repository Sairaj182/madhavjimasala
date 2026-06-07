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

export const YEAR_OF_ESTABLISHMENT: number = 1930;
export const FAMILY_GENERATIONS: number = 3;
export const SITE_INFO: SiteInfo = {
  name: "Madhavji Masala",
  tagline: "Pure Spices. Authentic Taste.",
  description:
    `Crafting the finest aromatic spices with heritage techniques and modern quality standards since ${YEAR_OF_ESTABLISHMENT}.`,
  foundedYear: YEAR_OF_ESTABLISHMENT,
  logoPath: "/images/madhavjimasala_logo_tbg.png",
  logoAlt: "Madhavji Masala",
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
      "Madhavji Masala Mill",
      "5, Vasant Engg. Compound, Dabhoi Road",
      "Opposite Yamuna Mill Road,",
      "Vadodara",
      "Gujarat 380004",
    ],
  },
  productionFacility: {
    label: "Production Facility",
    address: [
      "Madhavji Masala Mill",
      "5, Vasant Engg. Compound, Dabhoi Road",
      "Opposite Yamuna Mill Road,",
      "Vadodara",
      "Gujarat 380004",
    ],
  },
  phones: ["+91 9409371671", "+91 9825099832"],
  emails: ["madhavjimasalamill@gmail.com", "mitulraithatha74@gmail.com"],
  whatsapp: "+919427986767",
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
    "Tradition's purest craft - Our signature spice blends are a gift of authentic flavors, cultivated with care and love.",
  description:
    "From the fertile lands of Gujarat to kitchens, Madhavji Masala delivers purity in every pinch.",
  primaryCta: { label: "Our Products", href: "/products" },
  secondaryCta: { label: "Know Our Story", href: "/about" },
  backgroundImage: "/images/hero/hero-banner.png",
};

// ── Product Categories ───────────────────────

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { label: "All Collections", slug: "all" },
  { label: "Pickle Masalas", slug: "pickle-masalas" },
  { label: "Ground Spices", slug: "ground-spices" },
  { label: "Garam Masalas", slug: "garam-masalas" },
  { label: "Chutneys & Seasonings", slug: "chutneys-seasonings" },
  { label: "Snack Masalas", slug: "snack-masalas" },
];
// ── Products ─────────────────────────────────

export const PRODUCTS: Product[] = [
  {
  id: "prod-107",
  slug: "golden-garam-masala",
  name: "Golden Garam Masala",
  category: "Garam Masalas",
  categorySlug: "garam-masalas",
  description:
    "A premium blend of carefully selected whole spices, roasted and ground to perfection. Adds rich aroma, warmth, and depth to curries, vegetables, lentils, and rice dishes, making every meal more flavorful and authentic.",
  shortDescription:
    "Premium aromatic garam masala for everyday cooking.",
  price: 140,
  priceUnit: "200g",
  images: ["/images/DisplayProducts/MadhavjiGoldenGaramMasala.png"],
  packagingSizes: [
    { label: "100g Pouch", weight: "100g" },
    { label: "200g Pouch", weight: "200g" },
    { label: "500g Pack", weight: "500g" },
  ],
  tags: ["Garam Masala", "Aromatic", "Premium Blend"],
  usageTips: [
    "Add towards the end of cooking for maximum aroma.",
    "Sprinkle over curries before serving.",
    "Use in marinades for enhanced flavor depth.",
  ],
  perfectFor: [
    "Curries",
    "Sabzi",
    "Dal",
    "Rice Dishes",
  ],
  origin: "India",
  originDescription:
    "Prepared using a carefully balanced blend of premium Indian spices selected for their aroma, flavor, and consistency.",
  isFeatured: true,
  badges: ["Premium Blend", "Rich Aroma", "Authentic Taste"],
},

{
  id: "prod-108",
  slug: "silver-garam-masala",
  name: "Silver Garam Masala",
  category: "Garam Masalas",
  categorySlug: "garam-masalas",
  description:
    "A balanced spice blend designed to provide authentic Indian flavor and aroma. Crafted from quality spices for daily cooking and suitable for a wide range of traditional recipes.",
  shortDescription:
    "Balanced garam masala blend for everyday Indian cooking.",
  price: 120,
  priceUnit: "200g",
  images: ["/images/DisplayProducts/MadhavjiSilverGaramMasala.png"],
  packagingSizes: [
    { label: "100g Pouch", weight: "100g" },
    { label: "200g Pouch", weight: "200g" },
    { label: "500g Pack", weight: "500g" },
  ],
  tags: ["Garam Masala", "Traditional Blend", "Daily Use"],
  usageTips: [
    "Use in everyday curries and gravies.",
    "Mix into vegetable dishes for added warmth.",
    "Add a pinch before serving to enhance aroma.",
  ],
  perfectFor: [
    "Curries",
    "Dal",
    "Vegetables",
    "Rice",
  ],
  origin: "India",
  originDescription:
    "Made from a carefully selected combination of traditional Indian spices to deliver reliable flavor in everyday cooking.",
  isFeatured: true,
  badges: ["Traditional Blend", "Everyday Essential", "Quality Spices"],
},

{
  id: "prod-109",
  slug: "rajwadi-garam-masala",
  name: "Rajwadi Garam Masala",
  category: "Garam Masalas",
  categorySlug: "garam-masalas",
  description:
    "A royal-style garam masala inspired by traditional Rajwadi recipes. Rich in premium spices and crafted for bold aroma, intense flavor, and authentic restaurant-style results in every dish.",
  shortDescription:
    "Royal garam masala blend with bold aroma and flavor.",
  price: 160,
  priceUnit: "200g",
  images: ["/images/DisplayProducts/MadhavjiRajwadiGaramMasala.png"],
  packagingSizes: [
    { label: "100g Pouch", weight: "100g" },
    { label: "200g Pouch", weight: "200g" },
    { label: "500g Pack", weight: "500g" },
  ],
  tags: ["Rajwadi", "Premium Blend", "Restaurant Style"],
  usageTips: [
    "Ideal for rich gravies and royal-style dishes.",
    "Add near the end of cooking for best results.",
    "Use in biryani and paneer dishes for enhanced flavor.",
  ],
  perfectFor: [
    "Paneer",
    "Curries",
    "Gravy Dishes",
    "Biryani",
  ],
  origin: "Rajasthan, India",
  originDescription:
    "Inspired by traditional Rajwadi spice recipes known for their richness, complexity, and royal culinary heritage.",
  isFeatured: true,
  badges: ["Rajwadi Recipe", "Premium Quality", "Restaurant Style"],
},
  {
  id: "prod-101",
  slug: "athana-sambhar",
  name: "Athana Sambhar",
  category: "Pickle Masalas",
  categorySlug: "pickle-masalas",
  description:
    "A traditional Gujarati pickle masala crafted from carefully selected spices to deliver the authentic taste of homemade athana. Its balanced blend enhances mango, lemon, chilli, and mixed vegetable pickles with rich aroma, depth, and long-lasting flavor.",
  shortDescription:
    "Traditional Gujarati pickle masala for authentic homemade athana.",
  price: 120,
  priceUnit: "200g",
  images: ["/images/DisplayProducts/MadhavjiAthanaSambhar.png"],
  packagingSizes: [
    { label: "100g Pouch", weight: "100g" },
    { label: "200g Pouch", weight: "200g" },
    { label: "500g Pack", weight: "500g" },
  ],
  tags: ["Pickle Masala", "Gujarati Special", "Traditional Blend"],
  usageTips: [
    "Mix thoroughly with mango pieces before storing.",
    "Use only clean and dry utensils while preparing pickles.",
    "Allow the pickle to mature for a few days for best flavor.",
  ],
  perfectFor: [
    "Mango Pickle",
    "Lemon Pickle",
    "Mixed Pickle",
    "Vegetable Pickle",
  ],
  origin: "Gujarat, India",
  originDescription:
    "Inspired by traditional Gujarati pickle-making recipes and blended using carefully selected spices for authentic homemade flavor.",
  isFeatured: true,
  badges: ["Traditional Recipe", "Authentic Taste", "No Added Colors"],
},

{
  id: "prod-111",
  slug: "chilli-powder",
  name: "Chilli Powder",
  category: "Ground Spices",
  categorySlug: "ground-spices",
  description:
    "Finely ground chilli powder prepared from quality red chillies to deliver vibrant color, rich aroma, and consistent heat for everyday cooking. An essential spice for enhancing the taste and appearance of traditional Indian dishes.",
  shortDescription:
    "Premium red chilli powder with rich color and flavor.",
  price: 110,
  priceUnit: "200g",
  images: ["/images/DisplayProducts/MadhavjiChilliPowder.png"],
  packagingSizes: [
    { label: "100g Pouch", weight: "100g" },
    { label: "200g Pouch", weight: "200g" },
    { label: "500g Pack", weight: "500g" },
  ],
  tags: ["Chilli Powder", "Ground Spice", "Spicy"],
  usageTips: [
    "Use in curries for vibrant color and balanced heat.",
    "Add to marinades and spice mixes.",
    "Adjust quantity according to desired spice level.",
  ],
  perfectFor: [
    "Curries",
    "Gravies",
    "Marinades",
    "Snacks",
  ],
  origin: "India",
  originDescription:
    "Prepared from carefully selected red chillies sourced from quality-growing regions to ensure consistent color, flavor, and pungency.",
  isFeatured: true,
  badges: ["Rich Color", "Premium Quality", "Authentic Flavor"],
},

  {
  id: "prod-104",
  slug: "garlic-chatni",
  name: "Garlic Chatni",
  category: "Chutneys & Seasonings",
  categorySlug: "chutneys-seasonings",
  description:
    "A bold and flavorful garlic chutney blend made using premium garlic, spices, and chillies. Delivers a rich, spicy taste that perfectly complements snacks, sandwiches, dabeli, vada pav, and traditional meals.",
  shortDescription:
    "Spicy garlic chutney blend packed with authentic flavor.",
  price: 95,
  priceUnit: "200g",
  images: ["/images/DisplayProducts/MadhavjiGarlicChatni.png"],
  packagingSizes: [
    { label: "100g Pouch", weight: "100g" },
    { label: "200g Pouch", weight: "200g" },
    { label: "500g Pack", weight: "500g" },
  ],
  tags: ["Garlic", "Chutney", "Spicy"],
  usageTips: [
    "Sprinkle over sandwiches and burgers for extra flavor.",
    "Mix with oil to create a quick chutney dip.",
    "Use as a seasoning for snacks and street-food dishes.",
  ],
  perfectFor: [
    "Dabeli",
    "Vada Pav",
    "Sandwiches",
    "Snacks",
  ],
  origin: "Gujarat, India",
  originDescription:
    "Prepared using premium garlic and traditional spice blends inspired by Gujarat's popular street-food culture.",
  isFeatured: true,
  badges: ["Bold Flavor", "Street Food Favorite", "Premium Quality"],
},
{
  id: "prod-110",
  slug: "turmeric-powder",
  name: "Turmeric Powder",
  category: "Ground Spices",
  categorySlug: "ground-spices",
  description:
    "Bright yellow turmeric powder made from carefully selected turmeric roots. Known for its rich color, earthy flavor, and essential role in traditional Indian cooking. Finely ground to ensure consistent quality, aroma, and vibrant appearance in every dish.",
  shortDescription:
    "Pure turmeric powder with vibrant color and authentic flavor.",
  price: 90,
  priceUnit: "200g",
  images: ["/images/DisplayProducts/MadhavjiTurmericPowder.png"],
  packagingSizes: [
    { label: "100g Pouch", weight: "100g" },
    { label: "200g Pouch", weight: "200g" },
    { label: "500g Pack", weight: "500g" },
  ],
  tags: ["Turmeric", "Ground Spice", "Pure"],
  usageTips: [
    "Add during cooking for natural color and flavor.",
    "Use in marinades and spice blends.",
    "Mix into warm milk for a traditional turmeric drink.",
  ],
  perfectFor: [
    "Curries",
    "Dal",
    "Vegetables",
    "Marinades",
  ],
  origin: "India",
  originDescription:
    "Produced from carefully selected turmeric roots sourced from trusted farming regions and processed to maintain purity, color, and aroma.",
  isFeatured: true,
  badges: ["Pure Spice", "Rich Color", "Everyday Essential"],
},
{
  id: "prod-105",
  slug: "kachchi-dabeli-masala",
  name: "Kachchi Dabeli Masala",
  category: "Snack Masalas",
  categorySlug: "snack-masalas",
  description:
    "An authentic Kutch-style dabeli masala crafted to recreate the iconic street-food taste. Rich in aromatic spices with a perfect sweet-spicy balance that enhances homemade dabeli preparations.",
  shortDescription:
    "Authentic Kutch-style dabeli masala for street-food flavor.",
  price: 110,
  priceUnit: "200g",
  images: ["/images/DisplayProducts/MadhavjiKacchiDabeliMasala.png"],
  packagingSizes: [
    { label: "100g Pouch", weight: "100g" },
    { label: "200g Pouch", weight: "200g" },
    { label: "500g Pack", weight: "500g" },
  ],
  tags: ["Dabeli", "Kutch Special", "Street Food"],
  usageTips: [
    "Add while preparing dabeli stuffing for authentic taste.",
    "Mix with boiled potatoes for best flavor.",
    "Use sparingly to maintain the traditional sweet-spicy balance.",
  ],
  perfectFor: [
    "Dabeli",
    "Stuffing Mix",
    "Snack Preparations",
    "Street Food",
  ],
  origin: "Kutch, Gujarat",
  originDescription:
    "Inspired by the traditional dabeli recipes of Kutch, known for their rich aroma and signature sweet-spicy flavor profile.",
  isFeatured: true,
  badges: ["Kutch Special", "Authentic Recipe", "Street Food Classic"],
},

{
  id: "prod-106",
  slug: "khatti-mithi-chatni",
  name: "Khatti Mithi Chatni Powder",
  category: "Chutneys & Seasonings",
  categorySlug: "chutneys-seasonings",
  description:
    "A tangy and sweet chutney powder blend inspired by traditional Indian chaat flavors. Delivers a delicious balance of sweetness, sourness, and spice that elevates snacks and street-food dishes.",
  shortDescription:
    "Sweet and tangy chutney powder for chaat and snacks.",
  price: 90,
  priceUnit: "200g",
  images: ["/images/DisplayProducts/MadhavjiKhattiMithiChatni.png"],
  packagingSizes: [
    { label: "100g Pouch", weight: "100g" },
    { label: "200g Pouch", weight: "200g" },
    { label: "500g Pack", weight: "500g" },
  ],
  tags: ["Chatni", "Sweet", "Tangy"],
  usageTips: [
    "Sprinkle over chaat for enhanced flavor.",
    "Mix with water to prepare a quick chutney.",
    "Use as a seasoning for snacks and appetizers.",
  ],
  perfectFor: [
    "Chaat",
    "Samosa",
    "Kachori",
    "Snacks",
  ],
  origin: "India",
  originDescription:
    "Created using a blend of carefully selected spices and ingredients inspired by traditional Indian chaat and snack recipes.",
  isFeatured: false,
  badges: ["Sweet & Tangy", "Snack Companion", "Authentic Taste"],
},




{
  id: "prod-102",
  slug: "god-keri-sambhar",
  name: "God Keri Sambhar",
  category: "Pickle Masalas",
  categorySlug: "pickle-masalas",
  description:
    "A specially formulated masala for sweet mango pickles, delivering the perfect balance of sweetness, spice, and aroma. Prepared using premium spices to recreate the classic Gujarati God Keri taste enjoyed across generations.",
  shortDescription:
    "Authentic masala blend for sweet Gujarati mango pickles.",
  price: 130,
  priceUnit: "200g",
  images: ["/images/DisplayProducts/MadhavjiGodKeriSambhar.png"],
  packagingSizes: [
    { label: "100g Pouch", weight: "100g" },
    { label: "200g Pouch", weight: "200g" },
    { label: "500g Pack", weight: "500g" },
  ],
  tags: ["God Keri", "Pickle Masala", "Gujarati Special"],
  usageTips: [
    "Blend evenly with grated raw mango.",
    "Store in an airtight container for longer shelf life.",
    "Use quality oil to achieve authentic Gujarati taste.",
  ],
  perfectFor: [
    "Sweet Mango Pickle",
    "Seasonal Pickles",
    "Homemade Athana",
    "Traditional Preserves",
  ],
  origin: "Gujarat, India",
  originDescription:
    "Based on the famous Gujarati God Keri recipe known for its unique balance of sweetness and spice.",
  isFeatured: true,
  badges: ["Gujarati Specialty", "Premium Blend", "Traditional Recipe"],
},

{
  id: "prod-103",
  slug: "athana-sambhar-without-hing",
  name: "Athana Sambhar Without Hing",
  category: "Pickle Masalas",
  categorySlug: "pickle-masalas",
  description:
    "A hing-free version of our classic Athana Sambhar, offering the same authentic Gujarati pickle flavor while catering to customers who prefer pickle masala without asafoetida.",
  shortDescription:
    "Traditional athana masala without hing for authentic pickle preparation.",
  price: 120,
  priceUnit: "200g",
  images: ["/images/DisplayProducts/MadhavjiAthanaSambharWithoutHing.png"],
  packagingSizes: [
    { label: "100g Pouch", weight: "100g" },
    { label: "200g Pouch", weight: "200g" },
    { label: "500g Pack", weight: "500g" },
  ],
  tags: ["No Hing", "Pickle Masala", "Gujarati Special"],
  usageTips: [
    "Ideal for customers avoiding asafoetida.",
    "Mix evenly with pickle ingredients before storage.",
    "Store in a cool and dry place after opening.",
  ],
  perfectFor: [
    "Mango Pickle",
    "Lemon Pickle",
    "Mixed Pickle",
    "Vegetable Pickle",
  ],
  origin: "Gujarat, India",
  originDescription:
    "Crafted using traditional Gujarati pickle-making techniques while omitting hing for specific dietary preferences.",
  isFeatured: false,
  badges: ["No Hing", "Authentic Recipe", "Homemade Taste"],
},
];

// ── Trust Factors ────────────────────────────

export const TRUST_FACTORS: TrustFactor[] = [
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
      "Since our inception, Madhavji Masala has been more than a brand. It is a custodian of India's culinary soul. We began as a small apothecary of flavor, dedicated to preserving the ancient art that makes a meal a memory.",
      `Founded in ${YEAR_OF_ESTABLISHMENT} by Rasiklal Raithatha in the heart of Gujarat's spice country, we've grown from a humble grinding mill to one of the region's most trusted spice houses — without ever compromising on the principles that started it all.`,
      `Today, ${FAMILY_GENERATIONS} generations of the Madhavji family continue this legacy, combining time-honored techniques with modern quality standards to deliver spices that honor tradition while meeting the demands of contemporary kitchens.`,
    ],
    image: "/images/about/heritage.png",
  },
  vision: {
    title: "Our Global Vision",
    description:
      "To redefine the global standard of purity in the spice industry, ensuring that every household, regardless of geography, can access the authentic potent heart of traditional seasonings without compromise.",
    highlights: ["100+ Products & Forms", "Sustainable Cold Grinding"],
  },
  mission: {
    title: "Our Mission",
    description:
      "Through ethical sourcing, artisanal processing, and rigorous scientific hygiene, we bridge the gap between ancient tradition and modern manufacturing excellence.",
    highlights: ["FSSAI Certified"],
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
    title: "Madhavji Masala : Pure Spices. Authentic Taste.",
    description:
      "Premium Indian spices crafted with heritage techniques and modern quality standards. Explore our range of pure, lab-tested spices delivered from Gujarat to the customers.",
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
      "FSSAI certified, and lab-tested for purity. Explore the quality standards behind every Madhavji Masala product.",
    keywords: ["FSSAI certified spices", "ISO spice company", "quality certified masala"],
  },
  contact: {
    title: "Contact Us - Madhavji Masala",
    description:
      "Get in touch for wholesale inquiries, partnerships, or custom spice blending. Our team is ready to curate the perfect flavor profile for your business.",
    keywords: ["contact Madhavji Masala", "wholesale spices", "spice supplier India"],
  },
};
