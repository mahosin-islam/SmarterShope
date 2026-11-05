export interface ProductListItem {
  id: string;
  title: string;
  slug: string;
  sku: string;
  barcode: string | null;
  basePrice: number;
  comparePrice: number | null;
  costPrice: number | null;
  stock: number;
  lowStockThreshold: number;
  hasVariants: boolean;
  isActive: boolean;
  isArchived: boolean;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string | null } | null;
  images: Array<{ id: string; url: string; isThumbnail: boolean; altText: string | null }>;
  _count: {
    variants: number;
    reviews: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  products: ProductListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductStats {
  total: number;
  active: number;
  lowStock: number;
  outOfStock: number;
  archived: number;
}

export interface BulkStatusResult {
  message: string;
  updated: number;
}

export type ProductStatusFilter = 'all' | 'active' | 'inactive' | 'archived' | 'low_stock' | 'out_of_stock';

export type ProductSortBy = 'createdAt' | 'basePrice' | 'title' | 'stock';

export type ProductSortOrder = 'asc' | 'desc';

export type ProductView = 'table' | 'grid';

export interface ProductFilters {
  search: string;
  categoryId: string;
  brandId: string;
  status: ProductStatusFilter;
}

export interface ProductListState {
  page: number;
  limit: number;
  search: string;
  categoryId: string;
  brandId: string;
  status: ProductStatusFilter;
  sortBy: ProductSortBy;
  sortOrder: ProductSortOrder;
  view: ProductView;
  selectedIds: Set<string>;
}

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface BrandOption {
  id: string;
  name: string;
  slug: string | null;
}

export interface ProductRowAction {
  label: string;
  onClick: (id: string) => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}
