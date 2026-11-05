'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Search } from 'lucide-react';
import type { AddProductFormValues } from '../schema';
import { stripHtml, truncate } from '../utils/product';
import { Field, SectionCard, inputClassName } from './ui';

export function SeoSection() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<AddProductFormValues>();

  const seo = watch('seo') ?? {};
  const productTitle = watch('title') ?? '';
  const shortDescription = watch('shortDescription') ?? '';
  const description = watch('description') ?? '';
  const slug = watch('slug') ?? '';

  const previewTitle = seo.title?.trim() || productTitle || 'Product title';
  const previewDescription =
    seo.description?.trim() ||
    shortDescription.trim() ||
    truncate(stripHtml(description), 160) ||
    'Add a short description or SEO description to control how this product appears in search results.';
  const previewPath = `/products/${slug || 'product-slug'}`;

  return (
    <SectionCard
      title="SEO & Discoverability"
      description="Optional search metadata stored under Product.metadata.seo."
      icon={Search}
    >
      <div className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="SEO title"
            htmlFor="seo-title"
            error={errors.seo?.title?.message}
            hint={`${(seo.title ?? '').length}/70 characters. Falls back to the product title.`}
          >
            <input
              id="seo-title"
              type="text"
              maxLength={70}
              placeholder={productTitle || 'Search result title'}
              className={inputClassName}
              {...register('seo.title')}
            />
          </Field>

          <Field
            label="Canonical URL"
            htmlFor="seo-canonicalUrl"
            error={errors.seo?.canonicalUrl?.message}
            hint="Optional absolute URL used to prevent duplicate indexing."
          >
            <input
              id="seo-canonicalUrl"
              type="url"
              placeholder="https://example.com/products/..."
              className={inputClassName}
              {...register('seo.canonicalUrl')}
            />
          </Field>
        </div>

        <Field
          label="Meta description"
          htmlFor="seo-description"
          error={errors.seo?.description?.message}
          hint={`${(seo.description ?? '').length}/160 characters. Shown below the title in search results.`}
        >
          <textarea
            id="seo-description"
            rows={3}
            maxLength={160}
            placeholder="A concise, compelling description for search engines."
            className={`${inputClassName} resize-y`}
            {...register('seo.description')}
          />
        </Field>

        <Field
          label="Keywords"
          htmlFor="seo-keywords"
          error={errors.seo?.keywords?.message}
          hint="Comma-separated, up to 20 keywords."
        >
          <input
            id="seo-keywords"
            type="text"
            maxLength={500}
            placeholder="tailored blazer, silk blend, minimal luxury"
            className={inputClassName}
            {...register('seo.keywords')}
          />
        </Field>

        <div className="rounded-xl border border-[#e8e6e3] bg-white p-4">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            <Search className="h-3.5 w-3.5" />
            Search result preview
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">MODORA</p>
          <p className="mt-1 truncate text-base font-medium text-[#1a0dab]">{previewTitle}</p>
          <p className="mt-0.5 truncate text-[11px] text-neutral-500">{previewPath}</p>
          <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-neutral-600">{previewDescription}</p>
        </div>
      </div>
    </SectionCard>
  );
}
