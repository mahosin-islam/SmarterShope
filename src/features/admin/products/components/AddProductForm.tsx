'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm, useWatch, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PackagePlus, X } from 'lucide-react';
import { addProductSchema, createEmptyProductValues, type AddProductFormValues } from '../schema';
import type { ApiFieldError, BrandOption, CategoryOption, StoreSettings } from '../types';
import { adminProductService, AdminProductApiError } from '../services/admin-products.service';
import { buildCreateProductPayload } from '../utils/payload';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { BasicInfoSection } from './BasicInfoSection';
import { PricingInventorySection } from './PricingInventorySection';
import { VariantsSection } from './VariantsSection';
import { MediaSection } from './MediaSection';
import { OrganizationSection } from './OrganizationSection';
import { SeoSection } from './SeoSection';
import { ProductSidebar } from './ProductSidebar';
import { FormFooter } from './FormFooter';
import { ProductPreview } from './ProductPreview';

interface OptionLoadState {
  categories: CategoryOption[];
  brands: BrandOption[];
  currency: string;
  currencySymbol: string;
  loading: boolean;
  error: string | null;
}

function fallbackCurrencySymbol(currency: string): string {
  try {
    return (
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
      })
        .formatToParts(0)
        .find((part) => part.type === 'currency')?.value ?? currency
    );
  } catch {
    return currency;
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export function AddProductForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [options, setOptions] = useState<OptionLoadState>({
    categories: [],
    brands: [],
    currency: 'USD',
    currencySymbol: '$',
    loading: true,
    error: null,
  });
  const [uploadState, setUploadState] = useState({ active: 0, failed: 0 });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const methods = useForm<AddProductFormValues>({
    resolver: zodResolver(addProductSchema),
    defaultValues: createEmptyProductValues(),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const {
    control,
    getValues,
    trigger,
    setError,
    setValue,
    clearErrors,
    reset,
    formState: { isDirty, isSubmitting, isValidating },
  } = methods;

  useUnsavedChanges(isDirty || uploadState.active > 0 || uploadState.failed > 0);

  const loadOptions = useCallback(async () => {
    const [categoriesResult, brandsResult, settingsResult] = await Promise.allSettled([
      adminProductService.listCategories(),
      adminProductService.listBrands(),
      adminProductService.getPublicSettings(),
    ]);

    const settings: StoreSettings =
      settingsResult.status === 'fulfilled' ? settingsResult.value : {};
    const currency =
      typeof settings['store.currency'] === 'string' && settings['store.currency'].trim()
        ? settings['store.currency'].trim()
        : 'USD';
    const currencySymbol =
      typeof settings['store.currency_symbol'] === 'string' && settings['store.currency_symbol'].trim()
        ? settings['store.currency_symbol'].trim()
        : fallbackCurrencySymbol(currency);

    const failures: string[] = [];
    if (categoriesResult.status === 'rejected') {
      failures.push(`categories: ${errorMessage(categoriesResult.reason)}`);
    }
    if (brandsResult.status === 'rejected') {
      failures.push(`brands: ${errorMessage(brandsResult.reason)}`);
    }

    setOptions((current) => ({
      categories:
        categoriesResult.status === 'fulfilled' ? categoriesResult.value : current.categories,
      brands: brandsResult.status === 'fulfilled' ? brandsResult.value : current.brands,
      currency,
      currencySymbol,
      loading: false,
      error: failures.length > 0 ? `Could not load ${failures.join('; ')}.` : null,
    }));
  }, []);

  const refreshOptions = useCallback(() => {
    setOptions((current) => ({ ...current, loading: true, error: null }));
    void loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    const run = async () => {
      await loadOptions();
    };
    void run();
  }, [loadOptions]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const scrollToError = useCallback(() => {
    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, []);

  const onInvalid = useCallback(() => {
    setToast({ type: 'error', message: 'Please fix the highlighted fields before saving.' });
    scrollToError();
  }, [scrollToError]);

  const applyServerErrors = useCallback(
    (details: ApiFieldError[]) => {
      for (const detail of details) {
        setError(detail.field as Path<AddProductFormValues>, {
          type: 'server',
          message: detail.message,
        });
      }
      scrollToError();
    },
    [scrollToError, setError],
  );

  const submitProduct = useCallback(
    async (values: AddProductFormValues, isActive: boolean) => {
      if (uploadState.active > 0) {
        setToast({ type: 'error', message: 'Wait for all images to finish uploading before saving.' });
        return;
      }

      if (uploadState.failed > 0) {
        setToast({ type: 'error', message: 'Fix or remove failed image uploads before saving.' });
        return;
      }

      setToast(null);
      clearErrors();
      setValue('isActive', isActive, { shouldDirty: false });
      const payload = buildCreateProductPayload(values, isActive);

      try {
        const created = await adminProductService.createProduct(payload);
        setPreviewOpen(false);
        setToast({
          type: 'success',
          message: `Product "${created.title}" created successfully as ${
            created.isActive ? 'published' : 'draft'
          }. Redirecting to products...`,
        });
        reset(createEmptyProductValues());
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.setTimeout(() => router.push('/admin/products'), 1400);
      } catch (error) {
        if (error instanceof AdminProductApiError) {
          if (error.details.length > 0) {
            applyServerErrors(error.details);
          }

          const message = error.message.toLowerCase();
          if (message.includes('slug')) {
            setError('slug', { type: 'server', message: error.message });
          }
          if (message.includes('sku')) {
            const skuMatch = error.message.match(/:\s*([A-Za-z0-9_-]+)/);
            const variants = values.variants;
            const variantIndex = skuMatch
              ? variants.findIndex((variant) => variant.sku === skuMatch[1])
              : -1;

            if (variantIndex >= 0) {
              setError(`variants.${variantIndex}.sku` as Path<AddProductFormValues>, {
                type: 'server',
                message: error.message,
              });
            } else {
              setError('sku', { type: 'server', message: error.message });
            }
          }
          if (message.includes('category')) {
            setError('categoryId', { type: 'server', message: error.message });
          }
          if (message.includes('brand')) {
            setError('brandId', { type: 'server', message: error.message });
          }

          setToast({ type: 'error', message: error.message });
          scrollToError();
          return;
        }

        setToast({
          type: 'error',
          message: error instanceof Error ? error.message : 'Failed to create product. Please try again.',
        });
      }
    },
    [
      applyServerErrors,
      clearErrors,
      reset,
      router,
      scrollToError,
      setError,
      setValue,
      uploadState.active,
      uploadState.failed,
    ],
  );

  const submitWithStatus = useCallback(
    async (isActive: boolean) => {
      const valid = await trigger(undefined, { shouldFocus: true });
      if (!valid) {
        onInvalid();
        return;
      }
      await submitProduct(getValues(), isActive);
    },
    [getValues, onInvalid, submitProduct, trigger],
  );

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitWithStatus(getValues('isActive'));
  };

  const formValues = useWatch({ control });
  const values = formValues as AddProductFormValues;
  const categoryName = options.categories.find((category) => category.id === values.categoryId)?.name;
  const brandName = options.brands.find((brand) => brand.id === values.brandId)?.name;

  return (
    <FormProvider {...methods}>
      <form ref={formRef} onSubmit={handleFormSubmit} className="relative pb-6" noValidate>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff3ec] text-[#ff4600]">
                <PackagePlus className="h-4 w-4" />
              </span>
              <div>
                <h1 className="font-editorial text-2xl font-semibold text-neutral-900">Add New Product</h1>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Create a product connected to real categories, brands, and Cloudinary media.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            <span>Admin</span>
            <span>•</span>
            <span>Catalog</span>
            <span>•</span>
            <span className="text-[#ff4600]">Add product</span>
          </div>
        </div>

        {toast && (
          <div
            className={`mb-5 flex items-start justify-between gap-3 rounded-lg border px-4 py-2.5 text-xs ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
            role="status"
          >
            <p className="font-medium">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="mt-0.5 flex-shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-6">
            <BasicInfoSection />
            <PricingInventorySection currency={options.currency} currencySymbol={options.currencySymbol} />
            <VariantsSection />
            <MediaSection onUploadStateChange={setUploadState} />
            <SeoSection />
          </div>

          <div className="grid gap-6">
            <ProductSidebar
              organizationSlot={
                <OrganizationSection
                  categories={options.categories}
                  brands={options.brands}
                  loading={options.loading}
                  error={options.error}
                  onRetry={refreshOptions}
                />
              }
            />
          </div>
        </div>

        <FormFooter
          isSubmitting={isSubmitting}
          isValidating={isValidating}
          isDirty={isDirty}
          uploadingImages={uploadState.active > 0}
          failedUploads={uploadState.failed}
          onSaveDraft={() => {
            setValue('isActive', false, { shouldDirty: true });
            void submitWithStatus(false);
          }}
          onPublish={() => {
            setValue('isActive', true, { shouldDirty: true });
            void submitWithStatus(true);
          }}
          onPreview={() => setPreviewOpen(true)}
        />
      </form>

      {previewOpen && (
        <ProductPreview
          onClose={() => setPreviewOpen(false)}
          values={values}
          currency={options.currency}
          categoryName={categoryName}
          brandName={brandName}
        />
      )}
    </FormProvider>
  );
}
