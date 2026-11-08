import { CategoryItem, StoreProduct } from '@/types/store';
import { CURATED_ARCHIVES, FEATURED_PRODUCTS, NEW_ARRIVALS } from '@/features/store/home/data/mock-landing-data';

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

export function mapBackendProductToStoreProduct(p: BackendProduct): StoreProduct {
  const basePrice = Number(p.basePrice) || 0;
  const comparePrice = p.comparePrice ? Number(p.comparePrice) : undefined;
  const imageUrl = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop';

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
      name: p.category?.name || 'Artisanal Collection',
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

export const storeService = {
  /**
   * Fetch categories from backend. Gracefully fall back to CURATED_ARCHIVES.
   */
  async getCategories(): Promise<CategoryItem[]> {
    try {
      const res = await fetch(`${API_URL}/categories`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        const rawCategories: BackendCategory[] = json.data || [];

        if (rawCategories.length > 0) {
          return rawCategories.map((c, idx) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            imageUrl:
              c.imageUrl ||
              CURATED_ARCHIVES[idx % CURATED_ARCHIVES.length]?.imageUrl ||
              'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop',
            itemCount: c._count?.products,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return CURATED_ARCHIVES;
  },

  /**
   * Fetch single category by slug.
   */
  async getCategoryBySlug(slug: string): Promise<BackendCategory | null> {
    try {
      const res = await fetch(`${API_URL}/categories/${slug}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Fallback below
    }

    // Fallback from mock data
    const mockCat = CURATED_ARCHIVES.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
    if (mockCat) {
      return {
        id: mockCat.id,
        name: mockCat.name,
        slug: mockCat.slug,
        imageUrl: mockCat.imageUrl,
        description: `Explore our artisanal ${mockCat.name.toLowerCase()} collection, meticulously crafted from the world's finest textiles with effortless elegance.`,
      };
    }
    return null;
  },

  /**
   * Fetch featured products for the landing page.
   * If DB has featured products, use them. If none marked featured, fetch latest products.
   * Merges real DB products with fallback demo products if DB has fewer than 4 items.
   */
  async getFeaturedProducts(): Promise<StoreProduct[]> {
    try {
      let raw: BackendProduct[] = [];
      // 1. Try featured query
      const res = await fetch(`${API_URL}/products?featured=true&limit=8`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        raw = json.data || [];
      }

      // 2. If no products flagged as featured, pull latest active products from DB
      if (raw.length === 0) {
        const fallbackRes = await fetch(`${API_URL}/products?limit=8`, {
          cache: 'no-store',
        });
        if (fallbackRes.ok) {
          const json = await fallbackRes.json();
          raw = json.data || [];
        }
      }

      if (raw.length > 0) {
        const mapped = raw.map(mapBackendProductToStoreProduct);
        if (mapped.length >= 4) return mapped;
        const needed = 4 - mapped.length;
        const complementary = FEATURED_PRODUCTS.filter(
          (m) => !mapped.some((db) => db.id === m.id || db.slug === m.slug)
        );
        return [...mapped, ...complementary.slice(0, needed)];
      }
    } catch {
      // Fallback below
    }
    return FEATURED_PRODUCTS;
  },

  /**
   * Fetch new arrivals drop items for the landing page.
   */
  async getNewArrivals(): Promise<StoreProduct[]> {
    try {
      const res = await fetch(`${API_URL}/products?sortBy=createdAt&sortOrder=desc&limit=8`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        const raw: BackendProduct[] = json.data || [];
        if (raw.length > 0) {
          const mapped = raw.map(mapBackendProductToStoreProduct);
          if (mapped.length >= 4) return mapped;
          const needed = 4 - mapped.length;
          const complementary = NEW_ARRIVALS.filter(
            (m) => !mapped.some((db) => db.id === m.id || db.slug === m.slug)
          );
          return [...mapped, ...complementary.slice(0, needed)];
        }
      }
    } catch {
      // Fallback below
    }
    return NEW_ARRIVALS;
  },

  /**
   * Fetch products catalog with dynamic filters, pagination, and sorting.
   */
  async getProducts(filters: ProductFilters = {}): Promise<ProductListResult> {
    try {
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
      const res = await fetch(`${API_URL}/products${query}`, {
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json();
        const raw: BackendProduct[] = json.data || [];
        const meta = json.meta || {
          page: filters.page || 1,
          limit: filters.limit || 12,
          total: raw.length,
          totalPages: Math.ceil(raw.length / (filters.limit || 12)) || 1,
          hasNextPage: false,
          hasPrevPage: false,
        };

        if (raw.length > 0) {
          return {
            products: raw.map(mapBackendProductToStoreProduct),
            meta,
          };
        }
      }
    } catch {
      // Fallback
    }

    // Fallback: Filter mock products in memory if database returned no results or is unavailable
    let fallback = [...FEATURED_PRODUCTS, ...NEW_ARRIVALS];
    if (filters.category) {
      fallback = fallback.filter((p) => p.category.slug.toLowerCase() === filters.category?.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      fallback = fallback.filter((p) => p.title.toLowerCase().includes(q) || p.category.name.toLowerCase().includes(q));
    }
    if (filters.minPrice !== undefined) {
      fallback = fallback.filter((p) => p.basePrice >= (filters.minPrice ?? 0));
    }
    if (filters.maxPrice !== undefined) {
      fallback = fallback.filter((p) => p.basePrice <= (filters.maxPrice ?? 99999));
    }

    return {
      products: fallback,
      meta: {
        page: 1,
        limit: 12,
        total: fallback.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  },

  /**
   * Fetch single product by slug from backend.
   */
  async getProductBySlug(slug: string): Promise<BackendProduct | null> {
    try {
      const res = await fetch(`${API_URL}/products/${slug}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Fallback below
    }

    // Check mock products as graceful fallback
    const mock = [...FEATURED_PRODUCTS, ...NEW_ARRIVALS].find((p) => p.slug === slug);
    if (mock) {
      return {
        id: mock.id,
        title: mock.title,
        slug: mock.slug,
        description:
          'Exquisitely woven from pure Italian virgin wool and tailored in Florence. Designed with minimal structured shoulders, hand-finished horn buttons, and a fluid silhouette engineered for enduring distinction.',
        shortDescription: 'Tailored luxury garment handcrafted with artisanal care.',
        basePrice: mock.basePrice,
        comparePrice: mock.comparePrice,
        stock: 25,
        isFeatured: true,
        category: mock.category,
        brand: { name: 'MODORA Atelier', slug: 'modora-atelier' },
        images: [{ url: mock.imageUrl, altText: mock.title, isThumbnail: true }],
        variants: [
          { id: 'v1', title: 'Small / 46 EU', sku: `${mock.slug}-S`, price: mock.basePrice, stock: 8 },
          { id: 'v2', title: 'Medium / 48 EU', sku: `${mock.slug}-M`, price: mock.basePrice, stock: 12 },
          { id: 'v3', title: 'Large / 50 EU', sku: `${mock.slug}-L`, price: mock.basePrice, stock: 5 },
        ],
      };
    }

    return null;
  },

  /**
   * Fetch all active brands.
   */
  async getBrands(): Promise<StoreBrand[]> {
    try {
      const res = await fetch(`${API_URL}/brands`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        const brands = json.data || [];
        if (brands.length > 0) return brands;
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: 'b1',
        name: 'MODORA Atelier',
        slug: 'modora-atelier',
        description: 'Bespoke tailoring, coats and hand-crafted suiting from Florence & Zurich.',
        logoUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=400&auto=format&fit=crop',
      },
      {
        id: 'b2',
        name: 'Lanificio Biella',
        slug: 'lanificio-biella',
        description: 'Super 150s virgin merino and cashmere yarns milled in Piedmont, Italy.',
        logoUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=400&auto=format&fit=crop',
      },
      {
        id: 'b3',
        name: 'Nordic Knitwear Co.',
        slug: 'nordic-knitwear',
        description: 'Heavy gauge fisherman ribs and seamless alpaca sweaters made in Denmark.',
        logoUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=400&auto=format&fit=crop',
      },
      {
        id: 'b4',
        name: 'Cuoio Fiorentino',
        slug: 'cuoio-fiorentino',
        description: 'Full-grain Tuscan vegetable-tanned leather boots, holdalls, and belts.',
        logoUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop',
      },
    ];
  },

  /**
   * Fetch single brand by slug.
   */
  async getBrandBySlug(slug: string): Promise<StoreBrand | null> {
    try {
      const res = await fetch(`${API_URL}/brands/${slug}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Fallback
    }

    const brands = await this.getBrands();
    return brands.find((b) => b.slug.toLowerCase() === slug.toLowerCase()) || null;
  },
};
