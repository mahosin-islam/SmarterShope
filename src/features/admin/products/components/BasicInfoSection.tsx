'use client';

import React, { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { FileText, Sparkles } from 'lucide-react';
import type { AddProductFormValues } from '../schema';
import { slugify } from '../utils/product';
import { Field, SectionCard, inputClassName } from './ui';
import { RichTextEditor } from './RichTextEditor';

export function BasicInfoSection() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<AddProductFormValues>();
  const [slugEdited, setSlugEdited] = useState(false);

  const title = watch('title') ?? '';
  const slug = watch('slug') ?? '';
  const shortDescription = watch('shortDescription') ?? '';

  useEffect(() => {
    if (slugEdited) return;

    const nextSlug = slugify(title);
    if (nextSlug && nextSlug !== slug) {
      setValue('slug', nextSlug, { shouldDirty: true, shouldValidate: false });
    }
  }, [title, slug, slugEdited, setValue]);

  return (
    <SectionCard
      title="General Information"
      description="The core details customers see across the catalog and product page."
      icon={FileText}
    >
      <div className="grid gap-5">
        <Field
          label="Product title"
          htmlFor="title"
          required
          error={errors.title?.message}
          hint={`${title.length}/200 characters`}
        >
          <input
            id="title"
            type="text"
            maxLength={200}
            placeholder="e.g. Silk-blend tailored blazer"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'title-error' : undefined}
            className={inputClassName}
            {...register('title')}
          />
        </Field>

        <Field
          label="URL slug"
          htmlFor="slug"
          required
          error={errors.slug?.message}
          hint="Lowercase letters, numbers, and hyphens. Generated from the title until edited."
        >
          <div className="flex gap-2">
            <input
              id="slug"
              type="text"
              maxLength={200}
              placeholder="silk-blend-tailored-blazer"
              aria-invalid={Boolean(errors.slug)}
              aria-describedby={errors.slug ? 'slug-error' : undefined}
              className={inputClassName}
              {...register('slug', {
                onChange: () => setSlugEdited(true),
              })}
            />
            <button
              type="button"
              onClick={() => {
                setSlugEdited(false);
                setValue('slug', slugify(title), { shouldDirty: true, shouldValidate: true });
              }}
              disabled={!title.trim()}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-[#e8e6e3] bg-white px-3 text-xs font-semibold text-neutral-600 transition hover:border-[#ff4600]/40 hover:text-[#ff4600] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate
            </button>
          </div>
        </Field>

        <Field
          label="Short description"
          htmlFor="shortDescription"
          error={errors.shortDescription?.message}
          hint={`${shortDescription.length}/300 characters. Used in catalog cards and search results.`}
        >
          <textarea
            id="shortDescription"
            rows={2}
            maxLength={300}
            placeholder="A concise summary for product listings."
            aria-invalid={Boolean(errors.shortDescription)}
            aria-describedby={errors.shortDescription ? 'shortDescription-error' : undefined}
            className={`${inputClassName} resize-y`}
            {...register('shortDescription')}
          />
        </Field>

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Field
              label="Full description"
              htmlFor="description"
              required
              error={errors.description?.message}
            >
              <RichTextEditor
                id="description"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={Boolean(errors.description)}
                ariaDescribedBy={errors.description ? 'description-error' : undefined}
              />
            </Field>
          )}
        />
      </div>
    </SectionCard>
  );
}
