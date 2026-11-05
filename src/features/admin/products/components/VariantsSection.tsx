'use client';

import React, { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Layers, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import type { AddProductFormValues, ProductVariantFormValue } from '../schema';
import { buildVariantSku, uniqueList } from '../utils/product';
import { Badge, Field, SectionCard, Toggle, inputClassName } from './ui';

interface OptionTagInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}

function OptionTagInput({ label, values, onChange, placeholder }: OptionTagInputProps) {
  const [query, setQuery] = useState('');

  const addValues = () => {
    const additions = query
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (additions.length === 0) return;
    onChange(uniqueList([...values, ...additions]));
    setQuery('');
  };

  return (
    <div>
      <p className="block text-xs font-semibold text-neutral-700">{label}</p>
      <div className="mt-1.5 flex gap-2">
        <input
          type="text"
          value={query}
          maxLength={40}
          placeholder={placeholder}
          onChange={(event) => {
            const value = event.target.value;
            if (value.includes(',')) {
              const parts = value.split(',').map((part) => part.trim()).filter(Boolean);
              if (parts.length > 0) {
                onChange(uniqueList([...values, ...parts]));
                setQuery('');
                return;
              }
            }
            setQuery(value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              addValues();
            }
          }}
          className={inputClassName}
        />
        <button
          type="button"
          onClick={addValues}
          disabled={!query.trim()}
          className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg border border-[#e8e6e3] bg-white px-3 text-xs font-semibold text-neutral-600 transition hover:border-[#ff4600]/40 hover:text-[#ff4600] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {values.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 py-1 pl-2.5 pr-1.5 text-[11px] font-medium text-neutral-700"
            >
              {value}
              <button
                type="button"
                aria-label={`Remove ${value}`}
                onClick={() => onChange(values.filter((item) => item !== value))}
                className="rounded-full p-0.5 text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-1.5 text-[11px] text-neutral-400">Add one or more options to build the matrix.</p>
      )}
    </div>
  );
}

function attributesKey(attributes: Record<string, string>): string {
  return ['color', 'size']
    .map((key) => `${key}:${attributes[key] ?? ''}`)
    .join('|');
}

function nextVariantSku(
  baseSku: string,
  attributes: Record<string, string>,
  index: number,
  usedSkus: Set<string>,
): string {
  const base = buildVariantSku(baseSku, attributes, index);
  let candidate = base;
  let suffix = 2;

  while (usedSkus.has(candidate.toLowerCase())) {
    candidate = `${base.slice(0, 96)}-${suffix}`;
    suffix += 1;
  }

  usedSkus.add(candidate.toLowerCase());
  return candidate;
}

export function VariantsSection() {
  const {
    control,
    register,
    watch,
    getValues,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<AddProductFormValues>();
  const { fields, replace, remove } = useFieldArray({ control, name: 'variants' });

  const variants = watch('variants') ?? [];
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [matrixMessage, setMatrixMessage] = useState<string | null>(null);
  const activeCount = variants.filter((variant) => variant.isActive).length;

  const generateMatrix = () => {
    setMatrixMessage(null);

    if (colors.length === 0 && sizes.length === 0) {
      setMatrixMessage('Add at least one color or size before generating variants.');
      return;
    }

    const combinations: Array<Record<string, string>> = [];

    if (colors.length > 0 && sizes.length > 0) {
      for (const color of colors) {
        for (const size of sizes) {
          combinations.push({ color, size });
        }
      }
    } else if (colors.length > 0) {
      for (const color of colors) combinations.push({ color });
    } else {
      for (const size of sizes) combinations.push({ size });
    }

    const existing = getValues('variants') ?? [];
    const existingByAttributes = new Map(existing.map((variant) => [attributesKey(variant.attributes), variant]));
    const usedSkus = new Set<string>();
    const baseSku = getValues('sku') ?? '';
    const basePrice = Number(getValues('basePrice')) || 0;
    const comparePrice = getValues('comparePrice');
    const lowStockThreshold = Number(getValues('lowStockThreshold')) || 5;

    const rows: ProductVariantFormValue[] = combinations.map((attributes, index) => {
      const existingVariant = existingByAttributes.get(attributesKey(attributes));

      if (existingVariant) {
        usedSkus.add(existingVariant.sku.toLowerCase());
        return {
          ...existingVariant,
          attributes,
        };
      }

      return {
        title: Object.values(attributes).join(' / '),
        sku: nextVariantSku(baseSku, attributes, index, usedSkus),
        barcode: '',
        price: basePrice,
        comparePrice: comparePrice && comparePrice > basePrice ? comparePrice : undefined,
        costPrice: undefined,
        stock: 0,
        lowStockThreshold,
        attributes,
        isActive: true,
      };
    });

    replace(rows);
    clearErrors('variants');
  };

  return (
    <SectionCard
      title="Variants"
      description="Build combinations from colors and sizes, then set inventory and pricing for each variant."
      icon={Layers}
      badge={<Badge tone="primary">{variants.length} variants</Badge>}
    >
      <div className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <OptionTagInput
            label="Colors"
            values={colors}
            onChange={setColors}
            placeholder="e.g. Black, Ivory"
          />
          <OptionTagInput
            label="Sizes"
            values={sizes}
            onChange={setSizes}
            placeholder="e.g. XS, S, M, L"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={generateMatrix}
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
          >
            {variants.length > 0 ? <RefreshCw className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {variants.length > 0 ? 'Regenerate matrix' : 'Generate matrix'}
          </button>
          <p className="text-[11px] text-neutral-500">
            Regenerating preserves edited values for combinations that still exist.
          </p>
        </div>

        {matrixMessage && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-800" role="alert">
            {matrixMessage}
          </p>
        )}

        {variants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-[#faf9f6] px-6 py-10 text-center">
            <Layers className="mx-auto h-7 w-7 text-neutral-300" />
            <p className="mt-3 text-sm font-semibold text-neutral-700">No variants yet</p>
            <p className="mt-1 text-xs text-neutral-500">
              Add colors or sizes above, then generate the variant matrix.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Variant matrix
              </p>
              <p className="text-[11px] text-neutral-500">
                {activeCount} active · {variants.reduce((total, variant) => total + (Number(variant.stock) || 0), 0)} total units
              </p>
            </div>

            {fields.map((field, index) => {
              const variant = variants[index];
              if (!variant) return null;

              const fieldId = `variant-${field.id}`;
              const variantErrors = errors.variants?.[index];

              return (
                <div key={field.id} className="rounded-xl border border-[#e8e6e3] bg-[#faf9f6] p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Variant {index + 1}
                      </span>
                      {Object.entries(variant.attributes).map(([key, value]) => (
                        <Badge key={key} tone="neutral" className="capitalize">
                          {key}: {value}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4">
                      <Toggle
                        id={`${fieldId}-active`}
                        checked={variant.isActive}
                        onChange={(checked) =>
                          setValue(`variants.${index}.isActive`, checked, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        label="Active"
                      />
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="rounded-md p-1.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove variant ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Field
                      label="Variant name"
                      htmlFor={`${fieldId}-title`}
                      error={variantErrors?.title?.message}
                      className="xl:col-span-2"
                    >
                      <input
                        id={`${fieldId}-title`}
                        type="text"
                        maxLength={120}
                        className={inputClassName}
                        {...register(`variants.${index}.title`)}
                      />
                    </Field>

                    <Field
                      label="SKU"
                      htmlFor={`${fieldId}-sku`}
                      error={variantErrors?.sku?.message}
                      className="xl:col-span-2"
                    >
                      <input
                        id={`${fieldId}-sku`}
                        type="text"
                        maxLength={100}
                        className={`${inputClassName} font-mono`}
                        {...register(`variants.${index}.sku`)}
                      />
                    </Field>

                    <Field
                      label="Price"
                      htmlFor={`${fieldId}-price`}
                      error={variantErrors?.price?.message}
                    >
                      <input
                        id={`${fieldId}-price`}
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        className={inputClassName}
                        {...register(`variants.${index}.price`, { setValueAs: toNullableNumber })}
                      />
                    </Field>

                    <Field
                      label="Compare-at"
                      htmlFor={`${fieldId}-compare`}
                      error={variantErrors?.comparePrice?.message}
                    >
                      <input
                        id={`${fieldId}-compare`}
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="Optional"
                        className={inputClassName}
                        {...register(`variants.${index}.comparePrice`, { setValueAs: toNullableNumber })}
                      />
                    </Field>

                    <Field
                      label="Stock"
                      htmlFor={`${fieldId}-stock`}
                      error={variantErrors?.stock?.message}
                    >
                      <input
                        id={`${fieldId}-stock`}
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        className={inputClassName}
                        {...register(`variants.${index}.stock`, { setValueAs: toNullableNumber })}
                      />
                    </Field>

                    <Field
                      label="Low-stock alert"
                      htmlFor={`${fieldId}-threshold`}
                      error={variantErrors?.lowStockThreshold?.message}
                    >
                      <input
                        id={`${fieldId}-threshold`}
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        className={inputClassName}
                        {...register(`variants.${index}.lowStockThreshold`, { setValueAs: toNullableNumber })}
                      />
                    </Field>
                  </div>
                </div>
              );
            })}

            {typeof errors.variants?.message === 'string' && (
              <p className="text-[11px] font-medium text-red-600" role="alert">
                {errors.variants.message}
              </p>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function toNullableNumber(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}
