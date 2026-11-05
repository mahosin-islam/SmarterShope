'use client';

import React from 'react';
import Link from 'next/link';
import { Controller, useFormContext } from 'react-hook-form';
import { FolderTree } from 'lucide-react';
import type { AddProductFormValues } from '../schema';
import type { BrandOption, CategoryOption } from '../types';
import { Field, SectionCard } from './ui';
import { SearchableSelect } from './SearchableSelect';

interface OrganizationSectionProps {
  categories: CategoryOption[];
  brands: BrandOption[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function OrganizationSection({
  categories,
  brands,
  loading,
  error,
  onRetry,
}: OrganizationSectionProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<AddProductFormValues>();

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.parent ? `${category.parent.name} → ${category.name}` : category.name,
    meta: category.slug,
  }));

  const brandOptions = brands.map((brand) => ({
    value: brand.id,
    label: brand.name,
    meta: brand.slug,
  }));

  return (
    <SectionCard title="Organization" description="Place the product in the catalog hierarchy." icon={FolderTree}>
      <div className="grid gap-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] text-red-700" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-1.5 font-semibold underline underline-offset-2 hover:text-red-900"
            >
              Retry loading options
            </button>
          </div>
        )}

        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Field
              label="Category"
              htmlFor="categoryId"
              required
              error={errors.categoryId?.message}
              hint={
                <>
                  Need another category?{' '}
                  <Link href="/admin/categories" className="font-semibold text-[#ff4600] hover:underline">
                    Manage categories
                  </Link>
                </>
              }
            >
              <SearchableSelect
                id="categoryId"
                options={categoryOptions}
                value={field.value || undefined}
                onChange={(value) => field.onChange(value ?? '')}
                onBlur={field.onBlur}
                placeholder={loading ? 'Loading categories...' : 'Select a category'}
                searchPlaceholder="Search categories..."
                loading={loading}
                invalid={Boolean(errors.categoryId)}
                ariaDescribedBy={errors.categoryId ? 'categoryId-error' : undefined}
                emptyMessage={
                  <span>
                    No active categories found.{' '}
                    <Link href="/admin/categories" className="font-semibold text-[#ff4600] hover:underline">
                      Create one first
                    </Link>
                    .
                  </span>
                }
              />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="brandId"
          render={({ field }) => (
            <Field
              label="Brand"
              htmlFor="brandId"
              error={errors.brandId?.message}
              hint={
                <>
                  Optional. No brand? Leave empty.{' '}
                  <Link href="/admin/brands" className="font-semibold text-[#ff4600] hover:underline">
                    Manage brands
                  </Link>
                </>
              }
            >
              <SearchableSelect
                id="brandId"
                options={brandOptions}
                value={field.value || undefined}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={loading ? 'Loading brands...' : 'Select a brand'}
                searchPlaceholder="Search brands..."
                loading={loading}
                allowClear
                invalid={Boolean(errors.brandId)}
                ariaDescribedBy={errors.brandId ? 'brandId-error' : undefined}
                emptyMessage={
                  <span>
                    No active brands found.{' '}
                    <Link href="/admin/brands" className="font-semibold text-[#ff4600] hover:underline">
                      Create one first
                    </Link>
                    .
                  </span>
                }
              />
            </Field>
          )}
        />
      </div>
    </SectionCard>
  );
}
