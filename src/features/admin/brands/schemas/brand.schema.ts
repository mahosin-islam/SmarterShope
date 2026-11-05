import { z } from 'zod';

const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(100)
  .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only');

const nameSchema = z.string().trim().min(1, 'Brand name is required').max(100);

const optionalDescription = z.string().trim().max(500).optional();

const optionalWebsite = z.string().trim().url('Enter a valid website URL').optional().or(z.literal(''));

const optionalLogoUrl = z.string().trim().url('Enter a valid image URL').optional().or(z.literal(''));

export const brandFormSchema = z
  .object({
    name: nameSchema,
    slug: slugSchema,
    description: optionalDescription,
    logoUrl: optionalLogoUrl,
    website: optionalWebsite,
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.logoUrl !== undefined && data.logoUrl !== '' && !data.logoUrl.startsWith('http')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['logoUrl'],
        message: 'Logo URL must be a valid absolute URL',
      });
    }
    if (data.website !== undefined && data.website !== '' && !data.website.startsWith('http')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['website'],
        message: 'Website URL must be a valid absolute URL',
      });
    }
  });

export type BrandFormValues = z.infer<typeof brandFormSchema>;

export function createEmptyBrandValues(): BrandFormValues {
  return {
    name: '',
    slug: '',
    description: '',
    logoUrl: '',
    website: '',
    isActive: true,
  };
}
