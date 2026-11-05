'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Archive,
  CheckCircle2,
  Circle,
  Globe2,
  LockKeyhole,
  Star,
} from 'lucide-react';
import type { AddProductFormValues } from '../schema';
import { stripHtml } from '../utils/product';
import { SectionCard, Toggle } from './ui';

interface ProductSidebarProps {
  organizationSlot?: React.ReactNode;
}

const unsupportedCapabilities = [
  'Collections and department hierarchies',
  'Sales channel publishing',
  'Scheduled release dates',
  'Regional inventory hubs',
  'Faceted product tags',
];

export function ProductSidebar({ organizationSlot }: ProductSidebarProps) {
  const {
    watch,
    setValue,
    formState: { isSubmitting },
  } = useFormContext<AddProductFormValues>();

  const isActive = watch('isActive');
  const isFeatured = watch('isFeatured');
  const title = watch('title') ?? '';
  const slug = watch('slug') ?? '';
  const description = watch('description') ?? '';
  const categoryId = watch('categoryId') ?? '';
  const sku = watch('sku') ?? '';
  const basePrice = watch('basePrice');
  const images = watch('images') ?? [];
  const hasVariants = watch('hasVariants');
  const variants = watch('variants') ?? [];

  const checks = [
    { label: 'Title and URL slug', done: title.trim().length >= 2 && slug.trim().length >= 2 },
    { label: 'Description', done: stripHtml(description).length >= 10 },
    { label: 'Category', done: Boolean(categoryId) },
    { label: 'SKU', done: sku.trim().length >= 2 },
    { label: 'Price', done: typeof basePrice === 'number' && basePrice > 0 },
    { label: 'Product image', done: images.length > 0 },
    {
      label: 'Active variants',
      done: !hasVariants || variants.some((variant) => variant.isActive),
    },
  ];
  const completed = checks.filter((check) => check.done).length;
  const progress = Math.round((completed / checks.length) * 100);

  return (
    <div className="grid gap-5">
      <SectionCard title="Publishing" description="Control storefront visibility and merchandising." icon={Globe2}>
        <div className="grid gap-4">
          <div role="radiogroup" aria-label="Publishing status" className="grid gap-2">
            <button
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={isSubmitting}
              onClick={() => setValue('isActive', true, { shouldDirty: true })}
              className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                isActive
                  ? 'border-[#ff4600] bg-[#fff7f2] ring-1 ring-[#ff4600]/10'
                  : 'border-[#e8e6e3] bg-white hover:border-neutral-300'
              }`}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${
                  isActive ? 'border-[#ff4600] bg-[#ff4600]' : 'border-neutral-300 bg-white'
                }`}
              >
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-neutral-900">Active</span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-neutral-500">
                  Visible in the storefront immediately after saving.
                </span>
              </span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={!isActive}
              disabled={isSubmitting}
              onClick={() => setValue('isActive', false, { shouldDirty: true })}
              className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                !isActive
                  ? 'border-neutral-700 bg-neutral-50 ring-1 ring-neutral-700/10'
                  : 'border-[#e8e6e3] bg-white hover:border-neutral-300'
              }`}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${
                  !isActive ? 'border-neutral-700 bg-neutral-700' : 'border-neutral-300 bg-white'
                }`}
              >
                {!isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-neutral-900">Draft</span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-neutral-500">
                  Saved with <code className="text-[10px]">isActive: false</code> and hidden from shoppers.
                </span>
              </span>
            </button>

            <div className="flex items-start gap-3 rounded-lg border border-dashed border-neutral-200 bg-neutral-50/60 p-3 opacity-70">
              <LockKeyhole className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
              <div>
                <p className="text-xs font-semibold text-neutral-500">Archived</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-400">
                  Archive an existing product from All Products. New products cannot be created as archived.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#f0eeeb] pt-4">
            <Toggle
              id="isFeatured"
              checked={isFeatured}
              onChange={(checked) => setValue('isFeatured', checked, { shouldDirty: true })}
              label="Feature this product"
              description="Eligible for featured collections and merchandising slots."
            />
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-[#faf9f6] px-3 py-2 text-[10px] leading-relaxed text-neutral-500">
            <Archive className="mt-0.5 h-3 w-3 flex-shrink-0" />
            Save draft and Publish actions in the bottom bar set the final status.
          </div>
        </div>
      </SectionCard>

      {organizationSlot}

      <SectionCard
        title="Readiness"
        description="A quick check of the required catalog fields."
        icon={CheckCircle2}
        badge={
          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-semibold text-neutral-500">
            {completed}/{checks.length}
          </span>
        }
      >
        <div className="grid gap-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-[#ff4600] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ul className="grid gap-2">
            {checks.map((check) => (
              <li key={check.label} className="flex items-center gap-2 text-[11px]">
                {check.done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="h-3.5 w-3.5 flex-shrink-0 text-neutral-300" />
                )}
                <span className={check.done ? 'text-neutral-600' : 'text-neutral-400'}>{check.label}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 border-t border-[#f0eeeb] pt-3">
            <Star className={`h-3.5 w-3.5 ${isFeatured ? 'fill-[#ff4600] text-[#ff4600]' : 'text-neutral-300'}`} />
            <span className="text-[10px] text-neutral-400">
              {isFeatured ? 'Featured placement enabled' : 'Standard catalog placement'}
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Backend capabilities" description="Unsupported controls are intentionally not submitted.">
        <div className="grid gap-2.5">
          {unsupportedCapabilities.map((capability) => (
            <div key={capability} className="flex items-start gap-2">
              <LockKeyhole className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-neutral-300" />
              <p className="text-[11px] leading-relaxed text-neutral-500">{capability}</p>
            </div>
          ))}
          <p className="mt-1 border-t border-[#f0eeeb] pt-3 text-[10px] leading-relaxed text-neutral-400">
            The current Prisma schema has no fields or models for these features. Adding them requires a schema
            migration and backend approval.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
