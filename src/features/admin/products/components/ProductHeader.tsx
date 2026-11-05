'use client';

import React from 'react';
import { Home, ChevronRight, Plus, Download } from 'lucide-react';
import Link from 'next/link';
import { productListService } from '@/features/admin/products/services/product-list.service';

interface ProductHeaderProps {
  onAdd: () => void;
  onExport: () => void;
  exporting: boolean;
}

export function ProductHeader({ onAdd, onExport, exporting }: ProductHeaderProps) {
  return (
    <section className="border-b border-[#e8e6e3] bg-white pb-6">
      <div className="px-5 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <nav className="flex items-center gap-1.5 text-[10px] text-neutral-500">
          <Link href="/admin/dashboard" className="hover:text-neutral-900 transition">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 fill-neutral-300" />
          <Link href="/admin/dashboard" className="hover:text-neutral-900 transition">
            Dashboard
          </Link>
          <ChevronRight className="h-3 w-3 fill-neutral-300" />
          <span className="text-neutral-700 font-medium">Products</span>
        </nav>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-end gap-3 w-full sm:w-auto">
          <div>
            <h1 className="font-editorial text-xl font-semibold text-neutral-900 tracking-tight">
              Product Catalog
            </h1>
            <p className="mt-0.5 text-xs text-neutral-500">
              Manage your store products, pricing, inventory, and availability.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-lg border border-[#e8e6e3] bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 transition disabled:opacity-60 hover:bg-neutral-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-[#ff4600] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#e03e00] shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
