'use client';

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { categoryService } from '@/features/admin/categories/services/categories.service';
import type { AdminCategory } from '@/features/admin/categories/types/category.types';
import { CategoryForm } from '@/features/admin/categories/components/CategoryForm';
import { CategoryList } from '@/features/admin/categories/components/CategoryList';

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formCategoryId, setFormCategoryId] = useState<string | undefined>(undefined);

  const refreshCategories = () => {
    categoryService
      .listCategories()
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const apiError = err as { message?: string };
        setError(apiError?.message || 'Failed to load categories. Please try again.');
        setLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    categoryService
      .listCategories()
      .then((data) => {
        if (isMounted) {
          setCategories(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const apiError = err as { message?: string };
          setError(apiError?.message || 'Failed to load categories. Please try again.');
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = () => {
    setFormMode('create');
    setFormCategoryId(undefined);
    setFormOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (category: AdminCategory) => {
    setFormMode('edit');
    setFormCategoryId(category.id);
    setFormOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (category: AdminCategory) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await categoryService.deleteCategory(category.id);
      setSuccess('Category deleted successfully.');
      setError(null);
      refreshCategories();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message || 'Failed to delete category.');
      setSuccess(null);
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setFormCategoryId(undefined);
    setSuccess('Category saved successfully.');
    setError(null);
    refreshCategories();
  };

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e8e6e3] border-t-[#ff4600]" />
        <p className="mt-2 text-xs text-neutral-500">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-editorial text-xl font-semibold text-neutral-900 tracking-tight">
            Categories
          </h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Manage your product categories.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[#ff4600] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#e03e00] shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Category</span>
        </button>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] text-emerald-700 flex items-center gap-2">
          <span className="text-emerald-700">✓</span>
          <p>{success}</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[11px] text-red-700 flex items-center gap-2">
          <span className="text-red-700">⚠</span>
          <p>{error}</p>
        </div>
      )}

      {formOpen && (
        <CategoryForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSuccess={handleFormSuccess}
          mode={formMode}
          categoryId={formCategoryId}
          categories={categories}
        />
      )}

      <CategoryList
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
