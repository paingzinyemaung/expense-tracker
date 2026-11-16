import { z } from 'zod';

const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a hex like #22c55e');

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(30),
  color: colorSchema.optional(),
});

// PATCH အတွက်: field အားလုံး optional၊ ဒါပေမဲ့ အလွတ် {} မရ
export const updateCategorySchema = createCategorySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

// URL ထဲက :id
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
