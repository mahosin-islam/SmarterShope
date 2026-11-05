import { z } from 'zod';
import { MAX_IMAGES, splitCommaList, stripHtml } from './utils/product';

const optionalText = (max: number) => z.string().trim().max(max).optional();

const optionalPrice = z.number({ message: 'Enter a valid price' }).positive('Price must be greater than 0').optional();

const imageSchema = z.object({
  url: z
    .string()
    .url('Images must be uploaded before saving')
    .refine((url) => !url.startsWith('blob:'), 'Wait for image uploads to finish'),
  altText: optionalText(255),
  isThumbnail: z.boolean(),
});

const variantSchema = z.object({
  title: z.string().trim().min(1, 'Variant name is required').max(120),
  sku: z.string().trim().min(2, 'Variant SKU must be at least 2 characters').max(100),
  barcode: optionalText(100),
  price: z
    .number({ message: 'Enter a valid price' })
    .positive('Price must be greater than 0')
    .finite(),
  comparePrice: optionalPrice,
  costPrice: optionalPrice,
  stock: z
    .number({ message: 'Enter a stock quantity' })
    .int('Enter a whole number')
    .nonnegative('Stock cannot be negative'),
  lowStockThreshold: z
    .number({ message: 'Enter a threshold' })
    .int('Enter a whole number')
    .nonnegative('Threshold cannot be negative'),
  attributes: z.record(z.string(), z.string()),
  isActive: z.boolean(),
});

const seoSchema = z.object({
  title: optionalText(70),
  description: optionalText(160),
  keywords: optionalText(500),
  canonicalUrl: z.union([z.string().url('Enter a valid canonical URL'), z.literal('')]).optional(),
});

export const addProductSchema = z
  .object({
    title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
    slug: z
      .string()
      .trim()
      .min(2, 'Slug is required')
      .max(200)
      .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only'),
    sku: z.string().trim().min(2, 'SKU must be at least 2 characters').max(100),
    barcode: optionalText(100),
    shortDescription: optionalText(300),
    description: z
      .string()
      .refine((value) => stripHtml(value).length >= 10, 'Description must be at least 10 characters'),
    categoryId: z.string().uuid('Select a category'),
    brandId: z.string().uuid('Select a valid brand').optional(),
    basePrice: z.number({ message: 'Enter a valid price' }).positive('Price must be greater than 0'),
    comparePrice: optionalPrice,
    costPrice: optionalPrice,
    stock: z
      .number({ message: 'Enter a stock quantity' })
      .int('Enter a whole number')
      .nonnegative('Stock cannot be negative'),
    lowStockThreshold: z
      .number({ message: 'Enter a threshold' })
      .int('Enter a whole number')
      .nonnegative('Threshold cannot be negative'),
    hasVariants: z.boolean(),
    isFeatured: z.boolean(),
    isActive: z.boolean(),
    images: z.array(imageSchema).max(MAX_IMAGES),
    variants: z.array(variantSchema),
    seo: seoSchema,
  })
  .superRefine((data, ctx) => {
    if (data.comparePrice !== undefined && data.comparePrice < data.basePrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['comparePrice'],
        message: 'Compare price must be greater than or equal to the base price',
      });
    }

    if (data.hasVariants && data.variants.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['variants'],
        message: 'Generate at least one variant',
      });
    }

    if (data.hasVariants && data.variants.length > 0 && !data.variants.some((variant) => variant.isActive)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['variants'],
        message: 'At least one variant must be active',
      });
    }

    const seenSkus = new Set<string>();
    data.variants.forEach((variant, index) => {
      const key = variant.sku.toLowerCase();

      if (seenSkus.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['variants', index, 'sku'],
          message: 'Variant SKUs must be unique',
        });
      }
      seenSkus.add(key);

      if (variant.sku.toLowerCase() === data.sku.toLowerCase()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['variants', index, 'sku'],
          message: 'Variant SKU must differ from the product SKU',
        });
      }

      if (
        variant.comparePrice !== undefined &&
        variant.comparePrice < variant.price
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['variants', index, 'comparePrice'],
          message: 'Compare price must be greater than or equal to the variant price',
        });
      }

      if (Object.keys(variant.attributes).length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['variants', index, 'title'],
          message: 'Variant options are required',
        });
      }
    });

    if (data.seo.keywords) {
      const keywords = splitCommaList(data.seo.keywords);
      if (keywords.length > 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['seo', 'keywords'],
          message: 'Use no more than 20 keywords',
        });
      }
    }
  });

export type AddProductFormValues = z.infer<typeof addProductSchema>;
export type ProductVariantFormValue = z.infer<typeof variantSchema>;

export function createEmptyProductValues(): AddProductFormValues {
  return {
    title: '',
    slug: '',
    sku: '',
    barcode: '',
    shortDescription: '',
    description: '',
    categoryId: '',
    brandId: undefined,
    basePrice: 0,
    comparePrice: undefined,
    costPrice: undefined,
    stock: 0,
    lowStockThreshold: 5,
    hasVariants: false,
    isFeatured: false,
    isActive: true,
    images: [],
    variants: [],
    seo: {
      title: '',
      description: '',
      keywords: '',
      canonicalUrl: '',
    },
  };
}
