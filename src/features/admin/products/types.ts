export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  parent: { id: string; name: string } | null;
  isActive: boolean;
}

export interface BrandOption {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface StoreSettings {
  'store.currency'?: string;
  'store.currency_symbol'?: string;
}

export interface ProductImagePayload {
  url: string;
  altText?: string;
  sortOrder: number;
  isThumbnail: boolean;
}

export interface ProductVariantPayload {
  title: string;
  sku: string;
  barcode?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  attributes: Record<string, string>;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductSeoPayload {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
}

export interface CreateProductPayload {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  basePrice: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  hasVariants: boolean;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  brandId?: string;
  seo?: ProductSeoPayload;
  images: ProductImagePayload[];
  variants: ProductVariantPayload[];
}

export interface CreatedProduct {
  id: string;
  title: string;
  slug: string;
  sku: string;
  isActive: boolean;
  isArchived: boolean;
  category: { id: string; name: string } | null;
  brand: { id: string; name: string } | null;
  images: Array<{ id: string; url: string; isThumbnail: boolean }>;
  variants: Array<{ id: string; sku: string }>;
  createdAt: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}
