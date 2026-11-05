'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Search, Menu, LayoutGrid, List } from 'lucide-react';
import type { ProductStatusFilter, ProductSortBy, ProductSortOrder, ProductView } from '../types/product-list.types';

interface ProductToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: ProductSortBy;
  onSortByChange: (value: ProductSortBy) => void;
  sortOrder: ProductSortOrder;
  onSortOrderChange: (value: ProductSortOrder) => void;
  view: ProductView;
  onViewChange: (value: ProductView) => void;
  loading: boolean;
}

const SORT_OPTIONS: Array<{ value: ProductSortBy; label: string }> = [
  { value: 'createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'title', label: 'Name A–Z' },
  { value: 'title', label: 'Name Z–A' },
  { value: 'basePrice', label: 'Price: Low to High' },
  { value: 'basePrice', label: 'Price: High to Low' },
];

const ORDER_LABELS: Record<ProductSortOrder, string> = {
  asc: 'Ascending',
  desc: 'Descending',
};

export function ProductToolbar({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  view,
  onViewChange,
  loading,
}: ProductToolbarProps) {
  const [searchQuery, setSearchQuery] = useState(search);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearchChange(value);
      }, 300);
    },
    [onSearchChange]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <section className="px-5 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or SKU…"
            disabled={loading}
            className={`w-full rounded-lg border border-[#e8e6e3] bg-white pl-10 pr-3 py-2.5 text-[11px] text-neutral-900 placeholder:text-neutral-400 transition focus:border-[#ff4600] focus:outline-none focus:ring-2 focus:ring-[#ff4600]/15 disabled:cursor-not-allowed disabled:bg-neutral-50`}
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as ProductSortBy)}
            disabled={loading}
            className="rounded-lg border border-[#e8e6e3] bg-white px-3 py-2 text-[11px] text-neutral-700 focus:border-[#ff4600] focus:outline-none focus:ring-1 focus:ring-[#ff4600] disabled:cursor-not-allowed disabled:bg-neutral-50"
          >
            {SORT_OPTIONS.map((opt) => {
              const isMatch = opt.value === sortBy;
              return (
                <option key={`${opt.value}-${opt.label}`} value={opt.value}>
                  {isMatch ? opt.label : ''}
                </option>
              );
            })}
          </select>
          <select
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as ProductSortOrder)}
            disabled={loading}
            className="rounded-lg border border-[#e8e6e3] bg-white px-3 py-2 text-[11px] text-neutral-700 focus:border-[#ff4600] focus:outline-none focus:ring-1 focus:ring-[#ff4600] disabled:cursor-not-allowed disabled:bg-neutral-50"
          >
            <option value="asc">{ORDER_LABELS.asc}</option>
            <option value="desc">{ORDER_LABELS.desc}</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => onViewChange('table')}
            className={`p-2 rounded-lg transition ${
              view === 'table'
                ? 'bg-[#ff4600] text-white'
                : 'border border-[#e8e6e3] bg-white text-neutral-600 hover:bg-neutral-50'
            }`}
            title="Table view"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('grid')}
            className={`p-2 rounded-lg transition ${
              view === 'grid'
                ? 'bg-[#ff4600] text-white'
                : 'border border-[#e8e6e3] bg-white text-neutral-600 hover:bg-neutral-50'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
