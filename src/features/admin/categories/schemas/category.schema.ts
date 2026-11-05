import { z } from 'zod';

const slugSchema = z
  .string()
  .trim()
  .min(2, 'Slug must be at least 2 characters')
  .max(100)
  .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only');

const nameSchema = z.string().trim().min(1, 'Category name is required').max(100);

const optionalDescription = z.string().trim().max(500).optional();

export const categoryFormSchema = z
  .object({
    name: nameSchema,
    slug: slugSchema,
    description: optionalDescription,
    imageUrl: z.string().trim().url('Enter a valid image URL').optional().or(z.literal('')),
    parentId: z.string().uuid('Select a valid category').optional(),
    sortOrder: z
      .number({ message: 'Enter a valid sort order' })
      .int('Sort order must be a whole number')
      .nonnegative('Sort order cannot be negative'),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.imageUrl !== undefined && data.imageUrl !== '' && !data.imageUrl.startsWith('http')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['imageUrl'],
        message: 'Image URL must be a valid absolute URL',
      });
    }
  });

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function createEmptyCategoryValues(): CategoryFormValues {
  return {
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    parentId: undefined,
    sortOrder: 0,
    isActive: true,
  };
}
