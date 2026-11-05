'use client';

import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { BadgeDollarSign, Boxes } from 'lucide-react';
import type { AddProductFormValues } from '../schema';
import { formatMoney } from '../utils/product';
import { Field, SectionCard, Toggle, inputClassName } from './ui';

interface PricingInventorySectionProps {
  currency: string;
  currencySymbol: string;
}

function parseNumberInput(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const toOptionalNumber = parseNumberInput;
const toNumber = parseNumberInput;

export function PricingInventorySection({ currency, currencySymbol }: PricingInventorySectionProps) {
  const {
    register,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<AddProductFormValues>();

  const hasVariants = watch('hasVariants');
  const basePrice = watch('basePrice');
  const comparePrice = watch('comparePrice');
  const costPrice = watch('costPrice');
  const variants = watch('variants') ?? [];
  const totalVariantStock = variants.reduce((total, variant) => total + (Number(variant.stock) || 0), 0);

  useEffect(() => {
    if (hasVariants) {
      setValue('stock', totalVariantStock, { shouldValidate: false });
    }
  }, [hasVariants, totalVariantStock, setValue]);

  const margin =
    typeof basePrice === 'number' && typeof costPrice === 'number' && basePrice > 0 && costPrice > 0
      ? ((basePrice - costPrice) / basePrice) * 100
      : null;
  const discount =
    typeof basePrice === 'number' &&
    typeof comparePrice === 'number' &&
    comparePrice > basePrice &&
    comparePrice > 0
      ? ((comparePrice - basePrice) / comparePrice) * 100
      : null;

  const prefixPadding = currencySymbol.length > 1 ? 'pl-12' : 'pl-8';
  const pricePrefix = (
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400">
      {currencySymbol}
    </span>
  );

  return (
    <SectionCard
      title="Pricing & Inventory"
      description={`Prices are stored in ${currency}. SKUs and stock feed the live inventory ledger.`}
      icon={BadgeDollarSign}
    >
      <div className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Base price" htmlFor="basePrice" required error={errors.basePrice?.message}>
            <div className="relative">
              {pricePrefix}
              <input
                id="basePrice"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                aria-invalid={Boolean(errors.basePrice)}
                aria-describedby={errors.basePrice ? 'basePrice-error' : undefined}
                className={`${inputClassName} ${prefixPadding}`}
                {...register('basePrice', { setValueAs: toNumber })}
              />
            </div>
          </Field>

          <Field
            label="Compare-at price"
            htmlFor="comparePrice"
            error={errors.comparePrice?.message}
            hint={discount ? `${discount.toFixed(1)}% markdown shown in storefront.` : 'Optional original price.'}
          >
            <div className="relative">
              {pricePrefix}
              <input
                id="comparePrice"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="Optional"
                aria-invalid={Boolean(errors.comparePrice)}
                aria-describedby={errors.comparePrice ? 'comparePrice-error' : undefined}
                className={`${inputClassName} ${prefixPadding}`}
                {...register('comparePrice', { setValueAs: toOptionalNumber })}
              />
            </div>
          </Field>

          <Field
            label="Cost per item"
            htmlFor="costPrice"
            error={errors.costPrice?.message}
            hint={margin !== null ? `Estimated gross margin: ${margin.toFixed(1)}%.` : 'Used for internal margin reporting.'}
          >
            <div className="relative">
              {pricePrefix}
              <input
                id="costPrice"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="Optional"
                aria-invalid={Boolean(errors.costPrice)}
                aria-describedby={errors.costPrice ? 'costPrice-error' : undefined}
                className={`${inputClassName} ${prefixPadding}`}
                {...register('costPrice', { setValueAs: toOptionalNumber })}
              />
            </div>
          </Field>
        </div>

        <div className="rounded-lg border border-[#f0eeeb] bg-[#faf9f6] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-neutral-800">Product pricing preview</p>
              <p className="mt-1 text-[11px] text-neutral-500">
                {formatMoney(basePrice, currency)}
                {comparePrice && comparePrice > basePrice ? (
                  <span className="ml-2 text-neutral-400 line-through">{formatMoney(comparePrice, currency)}</span>
                ) : null}
              </p>
            </div>
            <span className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-neutral-500">
              {currency}
            </span>
          </div>
        </div>

        <div className="border-t border-[#f0eeeb] pt-5">
          <div className="mb-4 flex items-center gap-2">
            <Boxes className="h-4 w-4 text-neutral-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Inventory</h3>
          </div>

          <div className="grid gap-5">
            <Toggle
              id="hasVariants"
              checked={hasVariants}
              onChange={(checked) => {
                setValue('hasVariants', checked, { shouldDirty: true });
                if (!checked) {
                  setValue('variants', [], { shouldDirty: true, shouldValidate: false });
                  clearErrors('variants');
                }
              }}
              label="This product has variants"
              description="Use color and size combinations with individual SKUs, prices, and stock."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Product SKU"
                htmlFor="sku"
                required
                error={errors.sku?.message}
                hint="The parent SKU. Variant SKUs must be different."
              >
                <input
                  id="sku"
                  type="text"
                  maxLength={100}
                  placeholder="e.g. MOD-BLAZER-001"
                  aria-invalid={Boolean(errors.sku)}
                  aria-describedby={errors.sku ? 'sku-error' : undefined}
                  className={`${inputClassName} font-mono`}
                  {...register('sku')}
                />
              </Field>

              <Field
                label="Barcode / UPC"
                htmlFor="barcode"
                error={errors.barcode?.message}
                hint="Optional. Must be unique when supplied."
              >
                <input
                  id="barcode"
                  type="text"
                  maxLength={100}
                  placeholder="Optional"
                  aria-invalid={Boolean(errors.barcode)}
                  aria-describedby={errors.barcode ? 'barcode-error' : undefined}
                  className={`${inputClassName} font-mono`}
                  {...register('barcode')}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Stock on hand"
                htmlFor="stock"
                required
                error={hasVariants ? undefined : errors.stock?.message}
                hint={
                  hasVariants
                    ? 'Calculated from the inventory you enter for each variant.'
                    : 'Initial stock is recorded as a purchase receipt in the inventory ledger.'
                }
              >
                {hasVariants ? (
                  <div className={`${inputClassName} flex items-center justify-between bg-neutral-50 text-neutral-500`}>
                    <span>{totalVariantStock} units</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                      From variants
                    </span>
                  </div>
                ) : (
                  <input
                    id="stock"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    aria-invalid={Boolean(errors.stock)}
                    aria-describedby={errors.stock ? 'stock-error' : undefined}
                    className={inputClassName}
                    {...register('stock', { setValueAs: toNumber })}
                  />
                )}
              </Field>

              <Field
                label="Low-stock threshold"
                htmlFor="lowStockThreshold"
                required
                error={errors.lowStockThreshold?.message}
                hint="Alert the team when available stock reaches this level."
              >
                <input
                  id="lowStockThreshold"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.lowStockThreshold)}
                  aria-describedby={errors.lowStockThreshold ? 'lowStockThreshold-error' : undefined}
                  className={inputClassName}
                  {...register('lowStockThreshold', { setValueAs: toNumber })}
                />
              </Field>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
