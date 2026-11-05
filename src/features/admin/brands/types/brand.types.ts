export interface AdminBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
}

export interface BrandFormPayload {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
}

export interface BrandFieldError {
  field: string;
  message: string;
}

export type BrandStatusFilter = 'all' | 'active' | 'inactive';

export interface BrandFiltersState {
  search: string;
  status: BrandStatusFilter;
  showProductCounts: boolean;
}
