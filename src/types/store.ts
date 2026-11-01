/**
 * Store & Catalog Domain Models
 * Designed to seamlessly bind to backend REST API v1 models
 */

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  itemCount?: number;
}

export interface ProductBadge {
  text: string;
  variant: 'discount' | 'restocked' | 'new';
}

export interface StoreProduct {
  id: string;
  title: string;
  slug: string;
  category: {
    name: string;
    slug: string;
  };
  basePrice: number;
  comparePrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  badge?: ProductBadge;
  hasVariants?: boolean;
  colorOptionsCount?: number;
}

export interface ValueProp {
  icon: 'hanger' | 'leaf' | 'truck';
  title: string;
}

export interface AccordionItem {
  number: string;
  title: string;
  content: string;
}
