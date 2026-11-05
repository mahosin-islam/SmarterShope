'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ImageOff, PackageOpen, Star, X } from 'lucide-react';
import type { AddProductFormValues } from '../schema';
import { formatMoney, sanitizeHtml, stripHtml } from '../utils/product';

interface ProductPreviewProps {
  onClose: () => void;
  values: AddProductFormValues;
  currency: string;
  categoryName?: string;
  brandName?: string;
}

export function ProductPreview({
  onClose,
  values,
  currency,
  categoryName,
  brandName,
}: ProductPreviewProps) {
  const coverIndex = values.images.findIndex((image) => image.isThumbnail);
  const [selectedImage, setSelectedImage] = useState(() => Math.max(0, coverIndex));
  const activeImage = values.images[selectedImage] ?? values.images[coverIndex] ?? values.images[0];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const descriptionHtml = useMemo(() => sanitizeHtml(values.description), [values.description]);
  const descriptionText = stripHtml(values.description);
  const discount =
    values.comparePrice && values.comparePrice > values.basePrice
      ? ((values.comparePrice - values.basePrice) / values.comparePrice) * 100
      : null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-neutral-950/55 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-preview-title"
      onClick={onClose}
    >
      <div
        className="my-4 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e8e6e3] px-5 py-4">
          <div className="flex items-center gap-2">
            <PackageOpen className="h-4 w-4 text-[#ff4600]" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-800">Storefront preview</p>
              <p className="text-[10px] text-neutral-400">Preview only — nothing is saved from this window.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Close preview"
            className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="bg-[#f4f1ed] p-4 sm:p-6">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-white">
              {activeImage ? (
                <Image
                  src={activeImage.url}
                  alt={activeImage.altText || values.title || 'Product preview'}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-neutral-300">
                  <ImageOff className="h-10 w-10" />
                  <p className="mt-3 text-xs font-medium text-neutral-400">No product image</p>
                </div>
              )}
              {activeImage?.isThumbnail && (
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#ff4600] shadow-sm">
                  <Star className="h-3 w-3 fill-current" />
                  Cover
                </span>
              )}
            </div>

            {values.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {values.images.map((image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-16 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-white transition ${
                      selectedImage === index ? 'border-[#ff4600]' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      unoptimized
                      sizes="56px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                  values.isActive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
                }`}
              >
                {values.isActive ? 'Active' : 'Draft'}
              </span>
              {values.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#ff4600]/15 bg-[#fff3ec] px-2.5 py-1 text-[10px] font-semibold text-[#c2410c]">
                  <Star className="h-3 w-3 fill-current" />
                  Featured
                </span>
              )}
            </div>

            {(brandName || categoryName) && (
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                {[brandName, categoryName].filter(Boolean).join(' · ')}
              </p>
            )}

            <h2 id="product-preview-title" className="mt-2 font-editorial text-2xl font-semibold text-neutral-900">
              {values.title || 'Untitled product'}
            </h2>

            <div className="mt-3 flex flex-wrap items-baseline gap-2">
              <span className="text-lg font-semibold text-neutral-900">
                {formatMoney(values.basePrice, currency)}
              </span>
              {values.comparePrice && values.comparePrice > values.basePrice && (
                <>
                  <span className="text-sm text-neutral-400 line-through">
                    {formatMoney(values.comparePrice, currency)}
                  </span>
                  <span className="text-[11px] font-semibold text-[#c2410c]">
                    {discount?.toFixed(0)}% off
                  </span>
                </>
              )}
            </div>

            {values.shortDescription?.trim() && (
              <p className="mt-4 text-sm leading-relaxed text-neutral-600">{values.shortDescription}</p>
            )}

            {descriptionText ? (
              <div
                className="mt-4 max-h-48 overflow-y-auto text-xs leading-relaxed text-neutral-600 [&_a]:text-[#ff4600] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[#ff4600]/30 [&_blockquote]:pl-3 [&_h2]:mb-1 [&_h2]:mt-3 [&_h2]:font-editorial [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-neutral-900 [&_li]:ml-4 [&_ol]:list-decimal [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-neutral-950 [&_pre]:p-3 [&_pre]:text-neutral-100 [&_ul]:list-disc"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            ) : (
              <p className="mt-4 text-xs italic text-neutral-400">The full description will appear here.</p>
            )}

            <div className="mt-6 grid gap-2 border-t border-[#f0eeeb] pt-4 text-[11px]">
              <div className="flex justify-between gap-4">
                <span className="text-neutral-400">SKU</span>
                <span className="font-mono font-semibold text-neutral-700">{values.sku || '—'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-neutral-400">Availability</span>
                <span className="font-medium text-neutral-700">
                  {values.hasVariants
                    ? `${values.variants.reduce((total, variant) => total + (Number(variant.stock) || 0), 0)} units across ${values.variants.length} variants`
                    : `${values.stock} units`}
                </span>
              </div>
            </div>

            {values.hasVariants && values.variants.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Options</p>
                <div className="flex flex-wrap gap-1.5">
                  {values.variants.map((variant, index) => (
                    <span
                      key={`${variant.sku}-${index}`}
                      className={`rounded-full border px-2 py-1 text-[10px] font-medium ${
                        variant.isActive
                          ? 'border-neutral-200 bg-white text-neutral-600'
                          : 'border-neutral-100 bg-neutral-50 text-neutral-300 line-through'
                      }`}
                    >
                      {variant.title || variant.sku}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
