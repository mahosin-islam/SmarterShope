'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Path } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import { categoryService } from '../services/categories.service';
import type { AdminCategory } from '../types/category.types';
import type { CategoryFormValues } from '../schemas/category.schema';
import { categoryFormSchema } from '../schemas/category.schema';
import { Field } from '@/features/admin/products/components/ui';
import { SearchableSelect } from '@/features/admin/products/components/SearchableSelect';
import { Toggle } from '@/features/admin/products/components/ui';
import { CategoryImageUploader } from './CategoryImageUploader';

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  categoryId?: string;
  categories: AdminCategory[];
}

export function CategoryForm({
  open,
  onClose,
  onSuccess,
  mode,
  categoryId,
  categories,
}: CategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      parentId: undefined,
      sortOrder: 0,
      isActive: true,
    },
  });

  const editableParentOptions = categories.filter(
    (c) => mode !== 'edit' || c.id !== categoryId
  );

  const parentOptions = editableParentOptions.map((cat) => ({
    value: cat.id,
    label: cat.parent ? `${cat.parent.name} › ${cat.name}` : cat.name,
    meta: cat.slug,
  }));

  useEffect(() => {
    if (!open || mode !== 'edit' || !categoryId) return;

    categoryService
      .getCategory(categoryId)
      .then((category) => {
        setValue('name', category.name);
        setValue('slug', category.slug);
        setValue('description', category.description ?? '');
        setValue('imageUrl', category.imageUrl ?? '');
        setValue('parentId', category.parentId ?? undefined);
        setValue('sortOrder', category.sortOrder);
        setValue('isActive', category.isActive);
      })
      .catch(() => {
        setServerError('Failed to load category data.');
      });
  }, [open, mode, categoryId, categories.length, setValue]);

  const onSubmit = useCallback(
    async (values: CategoryFormValues) => {
      setLoading(true);
      setServerError(null);
      setSuccess(null);

      try {
        const payload = {
          name: values.name,
          slug: values.slug,
          description: values.description || undefined,
          imageUrl: values.imageUrl || undefined,
          parentId: values.parentId || undefined,
          sortOrder: values.sortOrder,
          isActive: values.isActive,
        };

        if (mode === 'create') {
          await categoryService.createCategory(payload);
        } else if (categoryId) {
          await categoryService.updateCategory(categoryId, payload);
        }

        setSuccess(mode === 'create' ? 'Category created successfully.' : 'Category updated successfully.');
        setTimeout(() => {
          setSuccess(null);
          onClose();
          onSuccess();
        }, 1200);
      } catch (error: unknown) {
        const apiError = error as {
          name?: string;
          message: string;
          details?: { field: string; message: string }[];
        };
        if (apiError.name === 'AdminCategoryApiError' && apiError.details) {
          for (const detail of apiError.details) {
            setError(detail.field as Path<CategoryFormValues>, { type: 'server', message: detail.message });
          }
          setServerError(apiError.message);
        } else {
          setServerError(
            error instanceof Error ? error.message : 'Failed to save category. Please try again.'
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [mode, categoryId, setError, onClose, onSuccess]
  );

  if (!open) return null;

  const imageUrl = watch('imageUrl');
  const parentValue = watch('parentId');
  const parentError = errors.parentId;

  return (
    <section className="rounded-xl border border-[#e8e6e3] bg-white shadow-2xs">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8e6e3]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#fff3ec] flex items-center justify-center text-[#c2410c] text-xs">
            <span>{mode === 'create' ? '+' : '✎'}</span>
          </div>
          <h2 className="font-semibold text-neutral-900">
            {mode === 'create' ? 'Add Category' : 'Edit Category'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
          aria-label="Close form"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {success && (
        <div className="px-5 py-3 border-b border-[#e8e6e3] flex items-center gap-2">
          <span className="text-[10px] font-semibold text-emerald-700">✓</span>
          <p className="text-xs text-emerald-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4" noValidate>
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] text-red-700" role="alert">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Category Name" htmlFor="name" required error={errors.name?.message}>
            <input
              id="name"
              {...register('name')}
              autoFocus
              disabled={loading}
              className={`w-full rounded-lg border border-[#e8e6e3] bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-[#ff4600] focus:outline-none focus:ring-2 focus:ring-[#ff4600]/15 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15' : ''}`}
            />
          </Field>

          <Field label="Slug" htmlFor="slug" required error={errors.slug?.message}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400">
                /categories/
              </span>
              <input
                id="slug"
                {...register('slug')}
                disabled={loading}
                className={`w-full rounded-lg border border-[#e8e6e3] bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-[#ff4600] focus:outline-none focus:ring-2 focus:ring-[#ff4600]/15 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 pl-10 ${errors.slug ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15' : ''}`}
              />
            </div>
            <p className="text-[10px] text-neutral-500 mt-1">
              Lowercase letters, numbers, and hyphens only.
            </p>
          </Field>

          <div className="md:col-span-2">
            <Field label="Description" htmlFor="description" error={errors.description?.message}>
              <textarea
                id="description"
                {...register('description')}
                rows={2}
                disabled={loading}
                placeholder="Briefly describe this category"
                className={`w-full rounded-lg border border-[#e8e6e3] bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-[#ff4600] focus:outline-none focus:ring-2 focus:ring-[#ff4600]/15 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15' : ''}`}
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <CategoryImageUploader
              currentUrl={imageUrl ?? null}
              onChange={(v) => setValue('imageUrl', v ?? '')}
            />
          </div>

          <div className="md:col-span-2">
            <div>
              <label htmlFor="parentId" className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Parent Category
              </label>
              <SearchableSelect
                id="parentId"
                options={parentOptions}
                value={parentValue || undefined}
                onChange={(value) => {
                  setValue('parentId', value ?? '');
                }}
                onBlur={() => {}}
                placeholder="No parent (root category)"
                searchPlaceholder="Search categories..."
                loading={loading}
                allowClear
                invalid={Boolean(parentError)}
                ariaDescribedBy={parentError ? 'parentId-error' : undefined}
                emptyMessage={<span>No parent categories available.</span>}
              />
              {parentError && (
                <p id="parentId-error" className="mt-1 text-[11px] font-medium text-red-600" role="alert">
                  {parentError.message}
                </p>
              )}
              <p className="mt-1 text-[10px] text-neutral-500">
                Leave empty for a top-level category.
              </p>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Sort Order
              </label>
              <input
                type="number"
                {...register('sortOrder', { valueAsNumber: true })}
                disabled={loading}
                min={0}
                className={`w-full rounded-lg border border-[#e8e6e3] bg-white px-3 py-2.5 text-sm text-neutral-900 transition focus:border-[#ff4600] focus:outline-none focus:ring-2 focus:ring-[#ff4600]/15 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 ${errors.sortOrder ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15' : ''}`}
              />
              {errors.sortOrder && (
                <p className="mt-1 text-[11px] font-medium text-red-600" role="alert">
                  {errors.sortOrder.message}
                </p>
              )}
            </div>
            <div className="flex items-end">
              <Toggle
                checked={watch('isActive')}
                onChange={(v) => setValue('isActive', v)}
                label="Active"
                description="Category is visible in the catalog"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#e8e6e3]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading || isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg border border-[#e8e6e3] bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 transition disabled:opacity-60 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[#ff4600] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#e03e00] disabled:cursor-not-allowed disabled:opacity-60 shadow-2xs"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span>Save Category</span>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
