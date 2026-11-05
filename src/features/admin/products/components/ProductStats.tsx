'use client';

import React from 'react';
import type { ProductStats } from '../types/product-list.types';
import { Badge } from '@/features/admin/products/components/ui';

interface ProductStatsProps {
  stats: ProductStats;
  loading: boolean;
}

const statColors: Record<keyof ProductStats, string> = {
  total: 'border-neutral-200 bg-neutral-50 text-neutral-600',
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  lowStock: 'border-amber-200 bg-amber-50 text-amber-700',
  outOfStock: 'border-red-200 bg-red-50 text-red-700',
  archived: 'border-neutral-200 bg-neutral-50 text-neutral-600',
};

const statLabels: Record<keyof ProductStats, string> = {
  total: 'Total Products',
  active: 'Active Products',
  lowStock: 'Low Stock',
  outOfStock: 'Out of Stock',
  archived: 'Archived',
};

export function ProductStats({ stats, loading }: ProductStatsProps) {
  const statsOrder: (keyof ProductStats)[] = ['total', 'active', 'lowStock', 'outOfStock', 'archived'];

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-5 py-4">
      {statsOrder.map((key) => (
        <section
          key={key}
          className={`rounded-xl border p-4 shadow-[0_1px_2px_rgba(18,18,18,0.03)] ${
            loading ? 'opacity-50 animate-pulse' : statColors[key]
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider">
                {statLabels[key]}
              </p>
              <p className="mt-1 text-2xl font-bold text-neutral-900">
                {loading ? '--' : stats[key]}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/50">
              <span className="text-[10px] font-semibold">
                {key === 'total' ? '#' : key === 'active' ? '+' : key === 'lowStock' ? '!' : key === 'outOfStock' ? 'x' : 'A'}
              </span>
            </div>
          </div>
        </section>
      ))}
    </section>
  );
}
