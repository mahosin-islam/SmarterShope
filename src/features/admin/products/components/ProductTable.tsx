'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Edit, Trash2, Archive, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { ProductListItem } from '../types/product-list.types';
import { Badge } from '@/features/admin/products/components/ui';

interface ProductRowProps {
  product: ProductListItem;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onEdit: (id: string) => void;
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

export function ProductRow({
  product,
  isSelected,
  onSelect,
  onEdit,
  onToggleStatus,
  onDelete,
  toggling,
}: ProductRowProps) {
  const status = stockStatus(product);
  const thumbnail = product.images.find((img) => img.isThumbnail) ?? product.images[0];

  return (
    <tr className="hover:bg-neutral-50/60 transition group border-b border-[#e8e6e3] last:border-0">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(product.id, !isSelected)}
          className="rounded border-[#e8e6e3] text-[#ff4600] focus:ring-[#ff4600] bg-neutral-50"
        />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          {thumbnail ? (
            <Image
              src={thumbnail.url}
              alt={thumbnail.altText ?? product.title}
              width={40}
              height={40}
              className="h-10 w-10 rounded-md object-cover border border-[#e8e6e3]"
              sizes="40px"
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-400">
              <Edit className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <Link
              href={`/admin/products/${product.id}`}
              className="font-medium text-neutral-900 truncate hover:text-[#ff4600] transition block"
            >
              {product.title}
            </Link>
            <span className="text-[10px] font-mono text-neutral-500 truncate block">{product.sku}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="text-xs text-neutral-600 truncate max-w-[140px] block">
          {product.category?.name || '—'}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="text-xs text-neutral-600 truncate max-w-[140px] block">
          {product.brand?.name || '—'}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="text-xs font-medium text-neutral-900">
          {product.basePrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-12 rounded-full bg-neutral-200 overflow-hidden">
            <div
              className={`h-full ${
                status.tone === 'success'
                  ? 'bg-emerald-500'
                  : status.tone === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((product.stock / Math.max(product.lowStockThreshold, 1)) * 100, 100)}%` }}
            />
          </div>
          <span className={`text-[10px] font-medium ${status.tone === 'success' ? 'text-emerald-600' : status.tone === 'warning' ? 'text-amber-600' : 'text-red-600'}`}>
            {status.label}
          </span>
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <Badge
          tone={product.isActive ? 'success' : 'danger'}
          className="text-[10px] px-2 py-1"
        >
          {product.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onToggleStatus(product.id, !product.isActive)}
            disabled={toggling.has(product.id)}
            className="p-1.5 text-neutral-500 hover:text-[#ff4600] hover:bg-[#fff3ec] rounded transition disabled:opacity-50"
            title={product.isActive ? 'Deactivate' : 'Activate'}
          >
            {toggling.has(product.id) ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              product.isActive ? (
                <Archive className="h-3.5 w-3.5" />
              ) : (
                <Archive className="h-3.5 w-3.5 text-emerald-600" />
              )
            )}
          </button>
          <button
            type="button"
            onClick={() => onEdit(product.id)}
            className="p-1.5 text-neutral-500 hover:text-[#ff4600] hover:bg-[#fff3ec] rounded transition"
            title="Edit"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(product.id)}
            className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

interface ProductTableProps {
  products: ProductListItem[];
  selectedIds: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onEdit: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  toggling: Set<string>;
}

export function ProductTable({
  products,
  selectedIds,
  onSelect,
  onSelectAll,
  onEdit,
  onToggleStatus,
  onDelete,
  toggling,
}: ProductTableProps) {
  const selectAllRef = useRef<HTMLInputElement>(null);
  const allSelected = products.length > 0 && products.every((p) => selectedIds.has(p.id));
  const indeterminate =
    products.length > 0 && !allSelected && products.some((p) => selectedIds.has(p.id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <section className="rounded-xl border border-[#e8e6e3] bg-white shadow-2xs overflow-hidden">
      <table className="w-full text-left text-[11px]">
        <thead className="border-b border-[#e8e6e3] bg-neutral-50">
          <tr>
            <th className="px-4 py-3 text-[10px] uppercase font-semibold text-neutral-400 tracking-wider w-10">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={() => onSelectAll(!allSelected)}
                className="rounded border-[#e8e6e3] text-[#ff4600] focus:ring-[#ff4600] bg-neutral-50"
              />
            </th>
            <th className="px-4 py-3 text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
              Product
            </th>
            <th className="px-4 py-3 text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
              Category
            </th>
            <th className="px-4 py-3 text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
              Brand
            </th>
            <th className="px-4 py-3 text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
              Inventory
            </th>
            <th className="px-4 py-3 text-[10px] uppercase font-semibold text-neutral-400 tracking-wider text-center">
              Status
            </th>
            <th className="px-4 py-3 text-[10px] uppercase font-semibold text-neutral-400 tracking-wider text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e8e6e3]">
          {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                isSelected={selectedIds.has(product.id)}
                onSelect={onSelect}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
                toggling={toggling}
              />
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-neutral-300 mb-2">—</span>
                  <p className="text-xs text-neutral-500">No products found</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
