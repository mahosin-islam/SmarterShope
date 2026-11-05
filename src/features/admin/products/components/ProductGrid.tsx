'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductListItem } from '../types/product-list.types';
import { Badge } from '@/features/admin/products/components/ui';

interface ProductCardProps {
  product: ProductListItem;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  toggling: Set<string>;
}

function stockStatus(product: ProductListItem): { label: string; tone: 'success' | 'warning' | 'danger' } {
  if (!product.isActive) return { label: 'Inactive', tone: 'danger' };
  if (product.stock <= 0) return { label: 'Out of Stock', tone: 'danger' };
  if (product.stock <= product.lowStockThreshold) return { label: 'Low Stock', tone: 'warning' };
  return { label: 'In Stock', tone: 'success' };
}

export function ProductCard({
  product,
  isSelected,
  onSelect,
  onEdit,
  onView,
  onToggleStatus,
  onDelete,
  toggling,
}: ProductCardProps) {
  const status = stockStatus(product);
  const thumbnail = product.images.find((img) => img.isThumbnail) ?? product.images[0];

  return (
    <section className="rounded-xl border border-[#e8e6e3] bg-white shadow-2xs flex flex-col hover:shadow-sm transition">
      <div className="flex items-center justify-between p-3 border-b border-[#e8e6e3]">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(product.id, !isSelected)}
          className="rounded border-[#e8e6e3] text-[#ff4600] focus:ring-[#ff4600] bg-neutral-50"
        />
        <button
          type="button"
          onClick={() => onToggleStatus(product.id, !product.isActive)}
          disabled={toggling.has(product.id)}
          className="p-1 text-neutral-400 hover:text-[#ff4600] hover:bg-[#fff3ec] rounded transition disabled:opacity-50"
          title={product.isActive ? 'Deactivate' : 'Activate'}
        >
          {toggling.has(product.id) ? (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#ff4600] border-t-transparent" />
          ) : product.isActive ? (
            <span className="h-3 w-3 text-emerald-600">●</span>
          ) : (
            <span className="h-3 w-3 text-neutral-400">●</span>
          )}
        </button>
      </div>
      <div className="h-32 relative overflow-hidden bg-neutral-100">
        {thumbnail ? (
          <Image
            src={thumbnail.url}
            alt={thumbnail.altText ?? product.title}
            fill
            className="object-cover"
            sizes="120px"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-neutral-400">
            <span className="text-[10px]">No Image</span>
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <Link
          href={`/admin/products/${product.id}`}
          className="font-medium text-neutral-900 truncate hover:text-[#ff4600] transition mb-0.5"
        >
          {product.title}
        </Link>
        <span className="text-[10px] font-mono text-neutral-500 truncate block mb-2">
          {product.sku}
        </span>
        <div className="flex items-center justify-between gap-2 mb-1 text-[10px]">
          <span className="text-neutral-500 truncate">{product.category?.name || '—'}</span>
          <span className="text-neutral-500 truncate">{product.brand?.name || '—'}</span>
        </div>
        <div className="mt-auto">
          <div className="flex items-baseline gap-1 mb-2">
            <span className="font-semibold text-neutral-900">
              {product.basePrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </span>
            {product.comparePrice && (
              <span className="text-[10px] text-neutral-400 line-through">
                {product.comparePrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            )}
          </div>
          <Badge tone={status.tone} className="text-[10px] px-2 py-0.5 mb-2">
            {status.label}
          </Badge>
          <Badge
            tone={product.isActive ? 'success' : 'danger'}
            className="text-[10px] px-2 py-0.5 mb-3"
          >
            {product.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(product.id)}
            className="flex-1 py-1.5 rounded border border-[#e8e6e3] text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(product.id)}
            className="flex-1 py-1.5 rounded border border-[#e8e6e3] text-xs font-semibold text-neutral-700 transition hover:bg-red-50 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </section>
  );
}

interface ProductGridProps {
  products: ProductListItem[];
  selectedIds: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  toggling: Set<string>;
}

export function ProductGrid({
  products,
  selectedIds,
  onSelect,
  onSelectAll,
  onEdit,
  onView,
  onToggleStatus,
  onDelete,
  toggling,
}: ProductGridProps) {
  const allSelected = products.length > 0 && products.every((p) => selectedIds.has(p.id));

  if (products.length === 0) {
    return (
      <section className="rounded-xl border border-[#e8e6e3] bg-white p-12 text-center">
        <span className="text-neutral-300 mb-2">—</span>
        <p className="text-xs text-neutral-500">No products found</p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-1">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isSelected={selectedIds.has(product.id)}
          onSelect={onSelect}
          onEdit={onEdit}
          onView={onView}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          toggling={toggling}
        />
      ))}
    </section>
  );
}
