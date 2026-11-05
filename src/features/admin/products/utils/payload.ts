import type { AddProductFormValues } from '../schema';
import type {
  CreateProductPayload,
  ProductImagePayload,
  ProductSeoPayload,
  ProductVariantPayload,
} from '../types';
import { sanitizeHtml, splitCommaList } from './product';

function optionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function buildImages(images: AddProductFormValues['images']): ProductImagePayload[] {
  let coverAssigned = false;

  return images.map((image, index) => {
    const isThumbnail = !coverAssigned && (image.isThumbnail || index === 0);
    if (isThumbnail) coverAssigned = true;

    return {
      url: image.url,
      altText: optionalText(image.altText),
      sortOrder: index,
      isThumbnail,
    };
  });
}

function buildSeo(seo: AddProductFormValues['seo']): ProductSeoPayload | undefined {
  const payload: ProductSeoPayload = {};
  const title = optionalText(seo.title);
  const description = optionalText(seo.description);
  const canonicalUrl = optionalText(seo.canonicalUrl);
  const keywords = seo.keywords ? splitCommaList(seo.keywords).slice(0, 20) : [];

  if (title) payload.title = title;
  if (description) payload.description = description;
  if (keywords.length > 0) payload.keywords = keywords;
  if (canonicalUrl) payload.canonicalUrl = canonicalUrl;

  return Object.keys(payload).length > 0 ? payload : undefined;
}

function buildVariants(variants: AddProductFormValues['variants']): ProductVariantPayload[] {
  return variants.map((variant, index) => ({
    title: variant.title.trim(),
    sku: variant.sku.trim(),
    ...(optionalText(variant.barcode) ? { barcode: optionalText(variant.barcode) } : {}),
    price: variant.price,
    ...(variant.comparePrice !== undefined ? { comparePrice: variant.comparePrice } : {}),
    ...(variant.costPrice !== undefined ? { costPrice: variant.costPrice } : {}),
    stock: variant.stock,
    lowStockThreshold: variant.lowStockThreshold,
    attributes: Object.fromEntries(
      Object.entries(variant.attributes).filter(([, value]) => value.trim().length > 0),
    ),
    sortOrder: index,
    isActive: variant.isActive,
  }));
}

export function buildCreateProductPayload(
  values: AddProductFormValues,
  isActive: boolean,
): CreateProductPayload {
  const variants = values.hasVariants ? buildVariants(values.variants) : [];
  const stock = values.hasVariants
    ? variants.reduce((total, variant) => total + variant.stock, 0)
    : values.stock;
  const seo = buildSeo(values.seo);

  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    description: sanitizeHtml(values.description),
    shortDescription: optionalText(values.shortDescription),
    sku: values.sku.trim(),
    barcode: optionalText(values.barcode),
    basePrice: values.basePrice,
    comparePrice: values.comparePrice,
    costPrice: values.costPrice,
    stock,
    lowStockThreshold: values.lowStockThreshold,
    hasVariants: values.hasVariants,
    isFeatured: values.isFeatured,
    isActive,
    categoryId: values.categoryId,
    brandId: optionalText(values.brandId),
    seo,
    images: buildImages(values.images),
    variants,
  };
}
