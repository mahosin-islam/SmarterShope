'use client';

import React, { useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Edit, Trash2, Archive, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { AdminCategory } from '../types/category.types';
import type { CategoryStatusFilter } from '../types/category.types';
import { categoryService } from '../services/categories.service';
import { Badge } from '@/features/admin/products/components/ui';

interface CategoryListProps {
  categories: AdminCategory[];
  onEdit: (category: AdminCategory) => void;
  onDelete: (category: AdminCategory) => void;
}

const PAGE_SIZE = 10;

export function CategoryList({
  categories,
  onEdit,
  onDelete,
}: CategoryListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CategoryStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        !search ||
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.slug.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || cat.isActive === (statusFilter === 'active');
      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  const toggleStatus = async (category: AdminCategory) => {
    setToggling((prev) => new Set([...prev, category.id]));
    try {
      await categoryService.updateCategoryStatus(category.id, !category.isActive);
    } catch {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(category.id);
        return next;
      });
    }
  };

  const goToPage = (targetPage: number) => {
    if (targetPage >= 1 && targetPage <= totalPages) {
      setPage(targetPage);
    }
  };

  if (categories.length === 0 && !search && statusFilter === 'all') {
    return (
      <section className="rounded-xl border border-[#e8e6e3] bg-white p-8 text-center">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
            <Search className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">No categories yet</h3>
          <p className="mt-1 text-[11px] text-neutral-500">
            Add your first category to organize products.
          </p>
        </div>
      </section>
    );
  }

  if (filtered.length === 0) {
    return (
      <section className="rounded-xl border border-[#e8e6e3] bg-white p-8 text-center">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Search className="h-5 w-5 text-neutral-300 mb-2" />
          <p className="text-xs font-medium text-neutral-700">No categories match your filters</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Try adjusting your search or filters.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-[#e8e6e3] bg-white shadow-2xs flex flex-col">
      <div className="p-5 border-b border-[#e8e6e3] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories"
            className="rounded-lg border border-[#e8e6e3] bg-white px-3 py-2 text-[11px] text-neutral-900 focus:border-[#ff4600] focus:outline-none focus:ring-1 focus:ring-[#ff4600]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CategoryStatusFilter)}
          className="rounded-lg border border-[#e8e6e3] bg-white px-2.5 py-1.5 text-[11px] text-neutral-700 focus:border-[#ff4600] focus:outline-none focus:ring-1 focus:ring-[#ff4600]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-x-auto border-b border-[#e8e6e3]">
        <table className="w-full text-left text-[11px]">
          <thead>
            <tr className="border-b border-[#e8e6e3] text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
              <th className="px-4 py-3" scope="col">Category</th>
              <th className="px-4 py-3" scope="col">Slug</th>
              <th className="px-4 py-3" scope="col">Parent</th>
              <th className="px-4 py-3 text-center" scope="col">Status</th>
              <th className="px-4 py-3 text-right" scope="col">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e6e3]">
            {paginated.map((category) => {
              const parent = categories.find((c) => c.id === category.parentId);
              const isToggling = toggling.has(category.id);
              return (
                <tr key={category.id} className="hover:bg-neutral-50/60 transition group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {category.imageUrl ? (
                        <div className="relative h-8 w-8 shrink-0">
                          <Image
                            src={category.imageUrl}
                            alt={`${category.name} banner`}
                            fill
                            className="rounded-md object-cover border border-[#e8e6e3]"
                            sizes="32px"
                          />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-400 shrink-0">
                          <Archive className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-neutral-900 truncate">{category.name}</p>
                        {category.description && (
                          <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-neutral-900 truncate max-w-[160px] block">{category.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-neutral-600 truncate max-w-[120px] block">
                      {parent?.name || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge tone={category.isActive ? 'success' : 'danger'} className="text-[10px] px-2 py-1">
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(category)}
                        className="p-1.5 text-neutral-500 hover:text-[#ff4600] hover:bg-[#fff3ec] rounded transition"
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      {category.isActive ? (
                        <button
                          type="button"
                          onClick={() => toggleStatus(category)}
                          disabled={isToggling}
                          className="p-1.5 text-neutral-500 hover:text-[#ff4600] hover:bg-[#fff3ec] rounded transition disabled:opacity-50"
                          title="Archive"
                        >
                          {isToggling ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Archive className="h-3.5 w-3.5" />
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleStatus(category)}
                          disabled={isToggling}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition disabled:opacity-50"
                          title="Restore"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete(category)}
                        className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-[#e8e6e3] flex items-center justify-between gap-4">
          <div className="text-[11px] text-neutral-500">
            Showing {start + 1}-{Math.min(start + paginated.length, filtered.length)} of {filtered.length} categories
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-[#e8e6e3] text-neutral-600 hover:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center gap-0.5">
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                const isActive = p === currentPage;
                const show =
                  p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1);
                if (!show) return null;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goToPage(p)}
                    className={`w-5 h-5 rounded text-xs transition ${
                      isActive
                        ? 'bg-[#ff4600] text-white'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-[#e8e6e3] text-neutral-600 hover:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
