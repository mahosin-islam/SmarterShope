'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Path } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import { brandService } from '../services/brands.service';
import type { BrandFormValues } from '../schemas/brand.schema';
import { brandFormSchema } from '../schemas/brand.schema';
import { Field } from '@/features/admin/products/components/ui';
import { Toggle } from '@/features/admin/products/components/ui';
import { BrandImageUploader } from './BrandImageUploader';
import { slugify } from '@/features/admin/products/utils/product';

interface BrandFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  brandId?: string;
}

export function BrandForm({
  open,
  onClose,
  onSuccess,
  mode,
  brandId,
}: BrandFormProps) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const slugManuallyEdited = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      logoUrl: '',
      website: '',
      isActive: true,
    },
  });

  const name = watch('name');
  const slug = watch('slug');

  // Auto-generate slug from name on create mode
  useEffect(() => {
    if (!open || mode !== 'create') return;
    if (slugManuallyEdited.current) return;
    if (!name) {
      setValue('slug', '', { shouldDirty: false });
      return;
    }
    const generated = slugify(name);
    if (generated && slug !== generated) {
      setValue('slug', generated, { shouldDirty: false });
    }
  }, [open, mode, name, slug, setValue]);

  useEffect(() => {
    if (!open || mode !== 'edit' || !brandId) return;

    brandService
      .getBrand(brandId)
      .then((brand) => {
        setValue('name', brand.name);
        setValue('slug', brand.slug);
        setValue('description', brand.description ?? '');
        setValue('logoUrl', brand.logoUrl ?? '');
        setValue('website', brand.website ?? '');
        setValue('isActive', brand.isActive);
        slugManuallyEdited.current = true; // Don't overwrite manually set slug in edit mode
      })
      .catch(() => {
        setServerError('Failed to load brand data.');
      });
  }, [open, mode, brandId, setValue]);

  const onNameChange = (value: string) => {
    if (mode === 'create' && !slugManuallyEdited.current) {
      const generated = slugify(value);
      if (generated) {
        setValue('slug', generated, { shouldDirty: false });
      }
    }
  };

  const onSlugChange = (value: string) => {
    slugManuallyEdited.current = value.length > 0;
    setValue('slug', value);
  };

  const onSubmit = useCallback(
    async (values: BrandFormValues) => {
      setLoading(true);
      setServerError(null);
      setSuccess(null);

      try {
        const payload = {
          name: values.name,
          slug: values.slug,
          description: values.description || undefined,
          logoUrl: values.logoUrl || undefined,
          website: values.website || undefined,
          isActive: values.isActive,
        };

        if (mode === 'create') {
          await brandService.createBrand(payload);
        } else if (brandId) {
          await brandService.updateBrand(brandId, payload);
        }

        setSuccess(mode === 'create' ? 'Brand created successfully.' : 'Brand updated successfully.');
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
        if (apiError.name === 'AdminBrandApiError' && apiError.details) {
          for (const detail of apiError.details) {
            setError(detail.field as Path<BrandFormValues>, { type: 'server', message: detail.message });
          }
          setServerError(apiError.message);
        } else {
          setServerError(
            error instanceof Error ? error.message : 'Failed to save brand. Please try again.'
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [mode, brandId, setError, onClose, onSuccess]
  );

  if (!open) return null;

  const imageUrl = watch('logoUrl');

  return (
    <section className="rounded-xl border border-[#e8e6e3] bg-white shadow-2xs">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8e6e3]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#fff3ec] flex items-center justify-center text-[#c2410c] text-xs">
            <span>{mode === 'create' ? '+' : '✎'}</span>
          </div>
          <h2 className="font-semibold text-neutral-900">
            {mode === 'create' ? 'Add Brand' : 'Edit Brand'}
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
          <Field label="Brand Name" htmlFor="name" required error={errors.name?.message}>
            <input
              id="name"
              {...register('name', { onChange: (e) => onNameChange(e.target.value) })}
              autoFocus
              disabled={loading}
              className={`w-full rounded-lg border border-[#e8e6e3] bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-[#ff4600] focus:outline-none focus:ring-2 focus:ring-[#ff4600]/15 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15' : ''}`}
            />
          </Field>

          <Field label="Slug" htmlFor="slug" required error={errors.slug?.message}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400">
                /brands/
              </span>
              <input
                id="slug"
                {...register('slug', { onChange: (e) => onSlugChange(e.target.value) })}
                disabled={loading}
                className={`w-full rounded-lg border border-[#e8e6e3] bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-[#ff4600] focus:outline-none focus:ring-2 focus:ring-[#ff4600]/15 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 pl-10 ${errors.slug ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15' : ''}`}
              />
            </div>
            <p className="text-[10px] text-neutral-500 mt-1">
              Lowercase letters, numbers, and hyphens only. Auto-generated from brand name.
            </p>
          </Field>

          <div className="md:col-span-2">
            <Field label="Description" htmlFor="description" error={errors.description?.message}>
              <textarea
                id="description"
                {...register('description')}
                rows={2}
                disabled={loading}
                placeholder="Briefly describe this brand"
                className={`w-full rounded-lg border border-[#e8e6e3] bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-[#ff4600] focus:outline-none focus:ring-2 focus:ring-[#ff4600]/15 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15' : ''}`}
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <BrandImageUploader currentUrl={imageUrl ?? null} onChange={(v) => setValue('logoUrl', v ?? '')} />
          </div>

          <div className="md:col-span-2">
            <Field label="Website URL" htmlFor="website" error={errors.website?.message}>
              <input
                id="website"
                {...register('website')}
                disabled={loading}
                placeholder="https://example.com"
                className={`w-full rounded-lg border border-[#e8e6e3] bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-[#ff4600] focus:outline-none focus:ring-2 focus:ring-[#ff4600]/15 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 ${errors.website ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15' : ''}`}
              />
              {errors.website && (
                <p className="mt-1 text-[11px] font-medium text-red-600" role="alert">
                  {errors.website.message}
                </p>
              )}
              <p className="text-[10px] text-neutral-500 mt-1">
                Include https:// or http://
              </p>
            </Field>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="flex items-end">
              <Toggle
                checked={watch('isActive')}
                onChange={(v) => setValue('isActive', v)}
                label="Active"
                description="Brand is visible in the catalog"
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
              <span>Save Brand</span>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
