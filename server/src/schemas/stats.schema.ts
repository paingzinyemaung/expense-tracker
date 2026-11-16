import { z } from 'zod';
import { typeSchema } from './transaction.schema.js';

export const statsQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const byCategoryQuerySchema = statsQuerySchema.extend({
  type: typeSchema.default('EXPENSE'),
});

export type StatsQuery = z.infer<typeof statsQuerySchema>;
export type ByCategoryQuery = z.infer<typeof byCategoryQuerySchema>;
