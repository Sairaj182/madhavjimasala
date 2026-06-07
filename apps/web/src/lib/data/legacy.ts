import { ReactNode } from 'react';

export const timelineData = [
  {
    year: '1930',
    title: 'The Beginning',
    image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=2071&auto=format&fit=crop',
    content: 'Founder Madhavji Nanji Raithatha established the business under the name: "Madhavji Nanji & Sons". Built on principles of honesty, quality and customer trust.',
    isHighlighted: false,
  },
  {
    year: '1964',
    title: 'Expansion in Bagasra',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop',
    content: 'The legacy was carried forward by:\n\n• Rasiklal Madhavji Raithatha\n• Sureshbhai Madhavji Raithatha\n\nThe family strengthened operations in Bagasra and expanded the business presence.',
    isHighlighted: false,
  },
  {
    year: '1985',
    title: 'A New Chapter',
    image: 'https://images.unsplash.com/photo-1517457211116-43ad0e77d077?q=80&w=1974&auto=format&fit=crop', // Vintage textile mill like
    content: 'Sureshbhai Madhavji Raithatha decided to pursue a separate entrepreneurial journey and established his own cloth manufacturing business.\n\nThis milestone respectfully marks the beginning of independent paths within the family.',
    isHighlighted: false,
  },
  {
    year: '1988',
    title: 'Journey to Vadodara',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1971&auto=format&fit=crop', // India architecture/city
    content: 'The Madhavji family shifted operations and future ambitions to Vadodara.\n\nThis move laid the foundation for future manufacturing expansion and larger market reach.',
    isHighlighted: false,
  },
  {
    year: '1992',
    title: 'Birth of Madhavji Masala Mill',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop', // Spices
    content: 'Brothers:\n\n• Mitul Rasiklal Raithatha\n• Suhag Rasiklal Raithatha\n\nstarted the Madhavji Masala manufacturing unit. This marked the transition from trading to organized spice manufacturing.',
    isHighlighted: true,
  },
];

export const generationsData = [
  {
    generation: 'Generation 1',
    members: [
      { name: 'Madhavji Nanji Raithatha', role: 'Founder', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop' }
    ]
  },
  {
    generation: 'Generation 2',
    members: [
      { name: 'Rasiklal Madhavji Raithatha', role: '', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop' },
      { name: 'Sureshbhai Madhavji Raithatha', role: '', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop' }
    ]
  },
  {
    generation: 'Generation 3',
    members: [
      { name: 'Mitul Rasiklal Raithatha', role: '', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop' },
      { name: 'Suhag Rasiklal Raithatha', role: '', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop' }
    ]
  }
];

export const valuesData = [
  {
    title: 'Quality',
    icon: 'Star', // We will map these to lucide-react icons in the component
    description: 'Uncompromising standards for every spice blend.'
  },
  {
    title: 'Integrity',
    icon: 'Shield',
    description: 'Honest practices built over decades of trading.'
  },
  {
    title: 'Authentic Taste',
    icon: 'Leaf',
    description: 'Preserving the true essence of traditional recipes.'
  },
  {
    title: 'Family Trust',
    icon: 'Heart',
    description: 'A legacy of relationships spanning four generations.'
  }
];

export const countersData = [
  { label: 'Years of Heritage', value: 94, suffix: '+' },
  { label: 'Generations', value: 4, suffix: '' },
  { label: 'Products', value: 50, suffix: '+' },
  { label: 'Customers Served', value: 1, suffix: 'M+' }
];

export const currentLeadershipData = [
  {
    name: 'Mitul Rasiklal Raithatha',
    role: 'Managing Director',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop'
  },
  {
    name: 'Suhag Rasiklal Raithatha',
    role: 'Operations Director',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop'
  }
];
