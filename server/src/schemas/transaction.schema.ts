import { z } from 'zod';

export const typeSchema = z.enum(['INCOME', 'EXPENSE']); // "const" ရှေ့မှာ export ထည့်
export const createTransactionSchema = z.object({
  amount: z
    .number()
    .int('Amount must be a whole number')
    .positive('Amount must be greater than 0')
    .max(2_000_000_000, 'Amount is too large'),
  type: typeSchema,
  date: z.coerce.date().refine(
    (d) => d.getTime() <= Date.now() + 60_000, // ၁ မိနစ် ခွင့်လွှတ် (စက်နာရီ အနည်းငယ်ကွာနိုင်လို့)
    'Date cannot be in the future',
  ),
  note: z.string().trim().max(200).nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
});

export const updateTransactionSchema = createTransactionSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

export const listTransactionsQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  type: typeSchema.optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
