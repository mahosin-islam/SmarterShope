export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
    children: number;
  };
}

export interface CategoryFormPayload {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CategoryReorderItem {
  id: string;
  sortOrder: number;
}

export interface CategoryFieldError {
  field: string;
  message: string;
}

export type CategoryStatusFilter = 'all' | 'active' | 'inactive';
export type CategoryRootFilter = 'all' | 'root' | 'child';

export interface CategoryFiltersState {
  search: string;
  status: CategoryStatusFilter;
  root: CategoryRootFilter;
  showProductCounts: boolean;
}

export interface CategoryTreeNode extends Omit<AdminCategory, '_count'> {
  _count: AdminCategory['_count'];
  children: CategoryTreeNode[];
}

export interface CategoryBreadcrumb {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryFormMode {
  type: 'create' | 'edit';
  categoryId?: string;
}

export interface CategorySelectionState {
  selectedIds: Set<string>;
  selectAll: boolean;
}
