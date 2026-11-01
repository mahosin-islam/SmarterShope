import { CategoryItem, StoreProduct, ValueProp, AccordionItem } from '@/types/store';

export const HERO_SLIDE = {
  tag: 'NEW ARRIVALS | COLLECTION 04',
  badge: 'WINTER CAPSULE',
  headline: 'Fluid Monochromes',
  subtitle: 'Tailored coats engineered for effortless juxtaposition. Limited batch.',
  ctaText: "DISCOVER MEN'S TAILORING",
  ctaLink: '/products?category=tailoring',
  pageIndicator: '03 / 08',
  imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop',
};

export const TICKER_DATA = {
  label: 'EDITORIAL CURATED // SPRING FEAT. 28',
  actionText: 'READ THE STORY',
  actionLink: '#editorial',
};

export const CURATED_ARCHIVES: CategoryItem[] = [
  {
    id: 'cat-tailoring',
    name: 'Tailoring',
    slug: 'tailoring',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600&auto=format&fit=crop',
    itemCount: 24,
  },
  {
    id: 'cat-knitwear',
    name: 'Knitwear',
    slug: 'knitwear',
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop',
    itemCount: 18,
  },
  {
    id: 'cat-footwear',
    name: 'Footwear',
    slug: 'footwear',
    imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=600&auto=format&fit=crop',
    itemCount: 12,
  },
  {
    id: 'cat-bags',
    name: 'Bags',
    slug: 'bags',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop',
    itemCount: 9,
  },
  {
    id: 'cat-accessories',
    name: 'Accessories',
    slug: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=600&auto=format&fit=crop',
    itemCount: 15,
  },
];

export const FEATURED_PRODUCTS: StoreProduct[] = [
  {
    id: 'prod-01',
    title: 'Atelier Wool Long Coat',
    slug: 'atelier-wool-long-coat',
    category: { name: 'OUTERWEAR', slug: 'outerwear' },
    basePrice: 465.0,
    comparePrice: 580.0,
    rating: 4.9,
    reviewCount: 118,
    badge: { text: '-20% OFF', variant: 'discount' },
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'prod-02',
    title: 'Relaxed Merino Turtleneck',
    slug: 'relaxed-merino-turtleneck',
    category: { name: 'KNITWEAR', slug: 'knitwear' },
    basePrice: 210.0,
    rating: 4.8,
    reviewCount: 82,
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'prod-03',
    title: 'The Sculpted Hobo Bag',
    slug: 'sculpted-hobo-bag',
    category: { name: 'BAGS', slug: 'bags' },
    basePrice: 390.0,
    rating: 5.0,
    reviewCount: 214,
    badge: { text: 'RESTOCKED', variant: 'restocked' },
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'prod-04',
    title: 'Classic Chelsea Boot',
    slug: 'classic-chelsea-boot',
    category: { name: 'FOOTWEAR', slug: 'footwear' },
    basePrice: 340.0,
    comparePrice: 420.0,
    rating: 4.9,
    reviewCount: 95,
    colorOptionsCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=800&auto=format&fit=crop',
  },
];

export const EDITORIAL_BANNER = {
  badge: 'LIMITED PRE-ORDER',
  title: 'The Modern Uniform — Edition 04',
  subtitle: 'Salient essentials refined for modern ease.',
  ctaText: 'EXPLORE SELECTION',
  ctaLink: '/products?collection=edition-04',
  imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
};

export const VALUE_PROPS: ValueProp[] = [
  { icon: 'hanger', title: 'Complimentary Tailoring' },
  { icon: 'leaf', title: 'Sustainable Sourcing' },
  { icon: 'truck', title: 'Express Global' },
];

export const NEW_ARRIVALS: StoreProduct[] = [
  {
    id: 'prod-05',
    title: 'Silk Crepe Blouse',
    slug: 'silk-crepe-blouse',
    category: { name: 'TOPS', slug: 'tops' },
    basePrice: 245.0,
    rating: 4.8,
    reviewCount: 42,
    badge: { text: 'NEW', variant: 'new' },
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'prod-06',
    title: 'Pleated Wide-Leg Pant',
    slug: 'pleated-wide-leg-pant',
    category: { name: 'BOTTOMS', slug: 'bottoms' },
    basePrice: 270.0,
    rating: 4.9,
    reviewCount: 61,
    badge: { text: 'NEW', variant: 'new' },
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'prod-07',
    title: 'Minimal Brass Signet Ring',
    slug: 'minimal-brass-signet-ring',
    category: { name: 'JEWELRY', slug: 'jewelry' },
    basePrice: 120.0,
    rating: 4.7,
    reviewCount: 29,
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'prod-08',
    title: 'Unstructured Linen Blazer',
    slug: 'unstructured-linen-blazer',
    category: { name: 'OUTERWEAR', slug: 'outerwear' },
    basePrice: 490.0,
    rating: 5.0,
    reviewCount: 38,
    imageUrl: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=800&auto=format&fit=crop',
  },
];

export const EDITORIAL_QUOTE = {
  quote: '“Exceptional drape and heirloom quality that redefines minimalist European luxury.”',
  publication: 'VOGUE PARIS EDITION',
  issue: 'Winter Haute Couture Edition',
};

export const MANIFESTO_DATA = {
  badge: '★ BRAND MANIFESTO',
  title: 'Crafted Without Compromise',
  description:
    'Every garment begins with regenerative fibers spun in heritage artisan mills across Biella, Italy. We eliminate excess seasonal runoff, creating enduring silhouettes meant to anchor your wardrobe for decades.',
  accordions: [
    {
      number: '01',
      title: 'The Florentine Guarantee',
      content:
        'All tailored pieces undergo individual quality checks and include complimentary lifetime repairs on structural seams.',
    },
    {
      number: '02',
      title: 'Detachable Tailoring',
      content:
        'Modular interior cuffs and collars engineered for seamless transitioning between casual ease and formal structure.',
    },
  ] as AccordionItem[],
};
