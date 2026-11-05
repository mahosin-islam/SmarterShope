'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productListService } from '@/features/admin/products/services/product-list.service';
import type {
  ProductListItem,
  ProductListResponse,
  ProductStats as ProductStatsType,
  ProductStatusFilter,
  ProductSortBy,
  ProductSortOrder,
  ProductView,
} from '@/features/admin/products/types/product-list.types';
import { ProductHeader } from './ProductHeader';
import { ProductStats } from './ProductStats';
import { ProductToolbar } from './ProductToolbar';
import { ProductFilters } from './ProductFilters';
import { ProductTable } from './ProductTable';
import { ProductGrid } from './ProductGrid';
import { ProductPagination } from './ProductPagination';
import { ProductBulkActions } from './ProductBulkActions';

export function ProductCatalog() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [stats, setStats] = useState<ProductStatsType>({
    total: 0,
    active: 0,
    lowStock: 0,
    outOfStock: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [status, setStatus] = useState<ProductStatusFilter>('all');
  const [sortBy, setSortBy] = useState<ProductSortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>('desc');
  const [view, setView] = useState<ProductView>('table');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toggling, setToggling] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  const hasActiveFilters =
    categoryId !== '' || brandId !== '' || status !== 'all' || search !== '';

  const refreshData = () => {
    productListService
      .listProducts({
        page,
        limit,
        search: search || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        status,
        sortBy,
        sortOrder,
      })
      .then((data: ProductListResponse) => {
        setProducts(data.products);
        setPage(data.meta.page);
        setLimit(data.meta.limit);
      })
      .catch(() => {
        setError('Failed to load products. Please try again.');
      });

    productListService
      .getProductStats({
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        search: search || undefined,
      })
      .then((data: ProductStatsType) => {
        setStats(data);
      })
      .catch(() => {
        // Stats failure is non-fatal; keep defaults
      });
  };

  useEffect(() => {
    let isMounted = true;

    productListService
      .listProducts({
        page,
        limit,
        search: search || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        status,
        sortBy,
        sortOrder,
      })
      .then((data: ProductListResponse) => {
        if (isMounted) {
          setProducts(data.products);
          setPage(data.meta.page);
          setLimit(data.meta.limit);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Failed to load products. Please try again.');
          setLoading(false);
        }
      });

    productListService
      .getProductStats({
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        search: search || undefined,
      })
      .then((data: ProductStatsType) => {
        if (isMounted) {
          setStats(data);
        }
      })
      .catch(() => {
        // Stats failure is non-fatal; keep defaults
      });

    return () => {
      isMounted = false;
    };
  }, [page, limit, search, categoryId, brandId, status, sortBy, sortOrder]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    setSelectedIds(new Set());
  };

  const handleFiltersChange = (filters: {
    categoryId: string;
    brandId: string;
    status: string;
  }) => {
    setCategoryId(filters.categoryId);
    setBrandId(filters.brandId);
    setStatus(filters.status as ProductStatusFilter);
    setPage(1);
    setSelectedIds(new Set());
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategoryId('');
    setBrandId('');
    setStatus('all');
    setPage(1);
    setSelectedIds(new Set());
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSelectedIds(new Set());
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    setSelectedIds(new Set());
  };

  const handleSortByChange = (value: ProductSortBy) => {
    setSortBy(value);
    setPage(1);
  };

  const handleSortOrderChange = (value: ProductSortOrder) => {
    setSortOrder(value);
    setPage(1);
  };

  const handleViewChange = (value: ProductView) => {
    setView(value);
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(products.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    setToggling((prev) => new Set([...prev, id]));
    try {
      await productListService.bulkUpdateStatus([id], isActive);
      setSuccess(`${isActive ? 'Activated' : 'Deactivated'} successfully.`);
      setError(null);
      refreshData();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message || 'Failed to update status.');
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Delete product "${id.slice(0, 8)}…"?`)) return;
    setDeleting((prev) => new Set([...prev, id]));
    try {
      // Use bulk status to deactivate (soft archive via delete endpoint would need separate call)
      // The backend DELETE endpoint archives the product. Use bulk-status for deactivate instead.
      // For delete, we call the backend delete via a direct fetch.
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1').replace(/\/$/, '');
      const res = await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Delete failed');
      setSuccess('Product archived successfully.');
      setError(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      refreshData();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message || 'Failed to archive product.');
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleBulkActivate = async () => {
    const ids = Array.from(selectedIds);
    setToggling((prev) => new Set([...prev, ...ids]));
    try {
      await productListService.bulkUpdateStatus(ids, true);
      setSuccess(`${ids.length} product(s) activated.`);
      setError(null);
      setSelectedIds(new Set());
      refreshData();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message || 'Bulk activate failed.');
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }
  };

  const handleBulkDeactivate = async () => {
    const ids = Array.from(selectedIds);
    setToggling((prev) => new Set([...prev, ...ids]));
    try {
      await productListService.bulkUpdateStatus(ids, false);
      setSuccess(`${ids.length} product(s) deactivated.`);
      setError(null);
      setSelectedIds(new Set());
      refreshData();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message || 'Bulk deactivate failed.');
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (
      !window.confirm(
        `Archive ${ids.length} product(s)? Archived products are hidden from the catalog but can be restored.`,
      )
    )
      return;
    setDeleting((prev) => new Set([...prev, ...ids]));
    try {
      // Archive each product individually via DELETE
      await Promise.all(
        ids.map((id) =>
          fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1').replace(/\/$/, '')}/admin/products/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            cache: 'no-store',
          }),
        ),
      );
      setSuccess(`${ids.length} product(s) archived.`);
      setError(null);
      setSelectedIds(new Set());
      refreshData();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message || 'Bulk archive failed.');
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await productListService.exportProducts({
        search: search || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        status,
        sortBy,
        sortOrder,
      });
      setSuccess('CSV export started.');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message || 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

  const handleAdd = () => {
    router.push('/admin/products/add');
  };

  const bulkActivating = toggling.size > 0;
  const bulkDeactivating = toggling.size > 0;
  const bulkDeleting = deleting.size > 0;

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-12">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#e8e6e3] border-t-[#ff4600]" />
        <p className="mt-2 text-xs text-neutral-500">Loading products…</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <ProductHeader onAdd={handleAdd} onExport={handleExport} exporting={exporting} />

      {success && (
        <div className="px-5 py-3 rounded-lg border border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700 flex items-center gap-2">
          <span className="text-emerald-700">✓</span>
          <p>{success}</p>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="ml-auto text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="px-5 py-3 rounded-lg border border-red-200 bg-red-50 text-[11px] text-red-700 flex items-center gap-2">
          <span className="text-red-700">⚠</span>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-red-700 hover:text-red-900"
          >
            Dismiss
          </button>
        </div>
      )}

      <ProductStats stats={stats} loading={loading} />

      <ProductToolbar
        search={search}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
        sortOrder={sortOrder}
        onSortOrderChange={handleSortOrderChange}
        view={view}
        onViewChange={handleViewChange}
        loading={loading}
      />

      <ProductFilters
        filters={{ categoryId, brandId, status }}
        onFiltersChange={handleFiltersChange}
        hasActiveFilters={hasActiveFilters}
        onReset={handleResetFilters}
        loading={loading}
      />

      <div className="px-5 py-4">
        {selectedIds.size > 0 && (
          <ProductBulkActions
            selectedCount={selectedIds.size}
            onActivate={handleBulkActivate}
            onDeactivate={handleBulkDeactivate}
            onDelete={handleBulkDelete}
            onClear={() => setSelectedIds(new Set())}
            activating={bulkActivating}
            deactivating={bulkDeactivating}
            deleting={bulkDeleting}
          />
        )}

        {view === 'table' ? (
          <ProductTable
            products={products}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onEdit={(id) => {
              router.push(`/admin/products/add?id=${id}`);
            }}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            toggling={toggling}
          />
        ) : (
          <ProductGrid
            products={products}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onEdit={(id) => {
              router.push(`/admin/products/add?id=${id}`);
            }}
            onView={(id) => {
              router.push(`/admin/products/${id}`);
            }}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            toggling={toggling}
          />
        )}
      </div>

      {products.length > 0 && (
        <ProductPagination
          page={page}
          limit={limit}
          total={stats.total}
          totalPages={Math.ceil(stats.total / limit)}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          disabled={loading}
        />
      )}
    </div>
  );
}
