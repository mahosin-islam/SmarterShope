'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductPaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  disabled?: boolean;
}

const PAGE_SIZES = [10, 25, 50, 100];

export function ProductPagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  disabled,
}: ProductPaginationProps) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const visiblePages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      visiblePages.push(i);
    } else if (
      (i === page - 2 && visiblePages[visiblePages.length - 1] !== '...') ||
      (i === page + 2 && visiblePages[visiblePages.length - 1] !== '...')
    ) {
      visiblePages.push('...');
    }
  }

  return (
    <section className="px-5 py-3 border-t border-[#e8e6e3] bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="text-[11px] text-neutral-500">
        Showing {total === 0 ? 0 : start}–{end} of {total} products
      </div>
      <div className="flex items-center gap-3">
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          disabled={disabled}
          className="rounded-lg border border-[#e8e6e3] bg-white px-2.5 py-1.5 text-[11px] text-neutral-700 focus:border-[#ff4600] focus:outline-none focus:ring-1 focus:ring-[#ff4600] disabled:cursor-not-allowed disabled:bg-neutral-50"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page === 1}
          className="p-1.5 rounded border border-[#e8e6e3] text-neutral-600 hover:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-center gap-0.5">
          {visiblePages.map((p, idx) => {
            if (p === '...') {
              return <span key={idx} className="text-[11px] text-neutral-500">…</span>;
            }
            const isActive = p === page;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p as number)}
                className={`w-5 h-5 rounded text-xs transition ${
                  isActive
                    ? 'bg-[#ff4600] text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                disabled={disabled}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page === totalPages}
          className="p-1.5 rounded border border-[#e8e6e3] text-neutral-600 hover:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}
