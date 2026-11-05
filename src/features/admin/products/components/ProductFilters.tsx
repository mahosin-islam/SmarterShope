'use client';

import React, { useEffect, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { adminProductService } from '@/features/admin/products/services/admin-products.service';
import type { CategoryOption, BrandOption } from '../types/product-list.types';

interface ProductFiltersProps {
  filters: {
    categoryId: string;
    brandId: string;
    status: string;
  };
  onFiltersChange: (filters: {
    categoryId: string;
    brandId: string;
    status: string;
  }) => void;
  hasActiveFilters: boolean;
  onReset: () => void;
  loading: boolean;
}

export function ProductFilters({
  filters,
  onFiltersChange,
  hasActiveFilters,
  onReset,
  loading,
}: ProductFiltersProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      adminProductService.listCategories(),
      adminProductService.listBrands(),
    ]).then(([catResult, brandResult]) => {
      if (!isMounted) return;
      if (catResult.status === 'fulfilled') setCategories(catResult.value);
      if (brandResult.status === 'fulfilled') setBrands(brandResult.value);
      setOptionsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (optionsLoading) {
    return (
      <section className="px-5 py-3 border-b border-[#e8e6e3] bg-white">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Filter className="h-3.5 w-3.5 animate-spin" />
          <span>Loading filters…</span>
        </div>
      </section>
    );
  }

  const activeCount =
    (filters.categoryId ? 1 : 0) +
    (filters.brandId ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0);

  return (
    <section className="border-b border-[#e8e6e3] bg-white">
      <div className="px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-neutral-400" />
          <span className="text-xs font-semibold text-neutral-700">Filters</span>
          {activeCount > 0 && (
            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#ff4600] px-1.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={filters.categoryId}
            onChange={(e) =>
              onFiltersChange({ ...filters, categoryId: e.target.value })
            }
            disabled={loading}
            className="rounded-lg border border-[#e8e6e3] bg-white px-3 py-2 text-[11px] text-neutral-700 focus:border-[#ff4600] focus:outline-none focus:ring-1 focus:ring-[#ff4600] disabled:cursor-not-allowed disabled:bg-neutral-50"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={filters.brandId}
            onChange={(e) => onFiltersChange({ ...filters, brandId: e.target.value })}
            disabled={loading}
            className="rounded-lg border border-[#e8e6e3] bg-white px-3 py-2 text-[11px] text-neutral-700 focus:border-[#ff4600] focus:outline-none focus:ring-1 focus:ring-[#ff4600] disabled:cursor-not-allowed disabled:bg-neutral-50"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
            disabled={loading}
            className="rounded-lg border border-[#e8e6e3] bg-white px-3 py-2 text-[11px] text-neutral-700 focus:border-[#ff4600] focus:outline-none focus:ring-1 focus:ring-[#ff4600] disabled:cursor-not-allowed disabled:bg-neutral-50"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              disabled={loading}
              className="text-xs font-semibold text-[#ff4600] hover:text-[#c2410c] underline disabled:opacity-60"
            >
              <X className="h-3 w-3 mr-1" />
              Reset
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
