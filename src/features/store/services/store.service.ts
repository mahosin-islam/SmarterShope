import { CategoryItem, StoreProduct } from '@/types/store';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1').replace(/\/$/, '');

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'basePrice' | 'title';
  sortOrder?: 'asc' | 'desc';
  featured?: boolean;
}

export interface ProductPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductListResult {
  products: StoreProduct[];
  meta: ProductPaginationMeta;
}

export interface BackendCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
  parentId?: string | null;
  _count?: { products: number };
}

export interface BackendProduct {
  id: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string | null;
  basePrice: number | string;
  comparePrice?: number | string | null;
  stock?: number;
  isFeatured?: boolean;
  category?: { id?: string; name: string; slug: string } | null;
  brand?: { id?: string; name: string; slug: string; logoUrl?: string | null } | null;
  images?: Array<{ id?: string; url: string; altText?: string | null; isThumbnail?: boolean }>;
  variants?: Array<{ id: string; title: string; sku: string; price: number; stock: number }>;
  reviews?: Array<{
    id: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
    user?: { firstName?: string | null; lastName?: string | null };
  }>;
}

export interface StoreBrand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  _count?: { products: number };
}

/** Map Prisma product DTO → StoreProduct (card shape) */
export function mapBackendProductToStoreProduct(p: BackendProduct): StoreProduct {
  const basePrice = Number(p.basePrice) || 0;
  const comparePrice = p.comparePrice ? Number(p.comparePrice) : undefined;
  const imageUrl =
    p.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop';

  let badge: StoreProduct['badge'] = undefined;
  if (comparePrice && comparePrice > basePrice) {
    const discount = Math.round(((comparePrice - basePrice) / comparePrice) * 100);
    badge = { text: `-${discount}%`, variant: 'discount' };
  } else if (p.isFeatured) {
    badge = { text: 'FEATURED', variant: 'new' };
  }

  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: {
      name: p.category?.name || 'Archive',
      slug: p.category?.slug || 'all',
    },
    basePrice,
    comparePrice,
    rating: 4.9,
    reviewCount: 18,
    imageUrl,
    badge,
    hasVariants: Boolean(p.variants && p.variants.length > 0),
    colorOptionsCount: p.variants?.length || undefined,
  };
}

/** Shared fetch helper — ISR cache: revalidate every 5 minutes */
async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 300 }, // 5-minute ISR — no blocking, no demo data needed
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export const storeService = {
  /** Fetch categories. Returns empty array if DB has none. */
  async getCategories(): Promise<CategoryItem[]> {
    const raw = await apiFetch<BackendCategory[]>('/categories');
    if (!raw || raw.length === 0) return [];
    return raw.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl:
        c.imageUrl ||
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop',
      itemCount: c._count?.products,
    }));
  },

  /** Fetch single category by slug. Returns null if not found. */
  async getCategoryBySlug(slug: string): Promise<BackendCategory | null> {
    return apiFetch<BackendCategory>(`/categories/${slug}`);
  },

  /** Featured products from DB. Returns only real products (no demo data). */
  async getFeaturedProducts(): Promise<StoreProduct[]> {
    // Try isFeatured=true first, fallback to latest if none marked
    const featured = await apiFetch<BackendProduct[]>('/products?featured=true&limit=8');
    if (featured && featured.length > 0) {
      return featured.map(mapBackendProductToStoreProduct);
    }
    // If nothing flagged as featured, return latest active products
    const latest = await apiFetch<BackendProduct[]>('/products?limit=8');
    if (latest && latest.length > 0) {
      return latest.map(mapBackendProductToStoreProduct);
    }
    return [];
  },

  /** New arrivals (sorted by newest). Returns only real products. */
  async getNewArrivals(): Promise<StoreProduct[]> {
    const raw = await apiFetch<BackendProduct[]>(
      '/products?sortBy=createdAt&sortOrder=desc&limit=8'
    );
    if (!raw || raw.length === 0) return [];
    return raw.map(mapBackendProductToStoreProduct);
  },

  /** Product catalog with dynamic filters, pagination, sorting. */
  async getProducts(filters: ProductFilters = {}): Promise<ProductListResult> {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.featured) params.set('featured', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';

    try {
      const res = await fetch(`${API_URL}/products${query}`, {
        next: { revalidate: 300 },
      });
      if (res.ok) {
        const json = await res.json();
        const raw: BackendProduct[] = json.data || [];
        const meta: ProductPaginationMeta = json.meta || {
          page: filters.page || 1,
          limit: filters.limit || 12,
          total: raw.length,
          totalPages: Math.ceil(raw.length / (filters.limit || 12)) || 1,
          hasNextPage: false,
          hasPrevPage: false,
        };
        return { products: raw.map(mapBackendProductToStoreProduct), meta };
      }
    } catch {
      /* fall through */
    }

    return {
      products: [],
      meta: {
        page: 1,
        limit: filters.limit || 12,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  },

  /** Single product detail by slug. Returns null if not found. */
  async getProductBySlug(slug: string): Promise<BackendProduct | null> {
    return apiFetch<BackendProduct>(`/products/${slug}`);
  },

  /** All active brands. Returns empty array if none. */
  async getBrands(): Promise<StoreBrand[]> {
    const raw = await apiFetch<StoreBrand[]>('/brands');
    return raw && raw.length > 0 ? raw : [];
  },

  /** Single brand by slug. Returns null if not found. */
  async getBrandBySlug(slug: string): Promise<StoreBrand | null> {
    const raw = await apiFetch<StoreBrand>(`/brands/${slug}`);
    if (raw) return raw;
    // Try matching from list as fallback
    const list = await this.getBrands();
    return list.find((b) => b.slug.toLowerCase() === slug.toLowerCase()) ?? null;
  },
};
