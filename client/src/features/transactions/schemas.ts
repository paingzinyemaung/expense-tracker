import { z } from 'zod';
import type { TransactionInput } from './types';

export const transactionFormSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),

  amount: z
    .string()
    .transform((v) => v.replace(/[,\s]/g, '')) // "1,500" → "1500"
    .pipe(
      z
        .string()
        .min(1, 'ပမာဏ ထည့်ပါ')
        .regex(/^\d+$/, 'ဂဏန်းသာ ထည့်ပါ')
        .refine((v) => Number(v) > 0, 'ပမာဏက ၀ ထက် ကြီးရမည်')
        .refine((v) => Number(v) <= 2_000_000_000, 'ပမာဏ အရမ်းကြီးနေသည်'),
    ),

  categoryId: z.string(), // "" = အမျိုးအစားမရှိ

  date: z
    .string()
    .min(1, 'ရက်စွဲ ရွေးပါ')
    .refine((v) => !Number.isNaN(new Date(v).getTime()), 'ရက်စွဲ မမှန်ပါ')
    .refine(
      (v) => new Date(v).getTime() <= Date.now() + 60_000,
      'အနာဂတ်ရက်ကို မရွေးနိုင်ပါ',
    ),

  note: z.string().trim().max(200, 'မှတ်ချက်က ၂၀၀ လုံးထက် မကျော်ရ'),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

// Form တန်ဖိုး (string များ) → Server ပို့မယ့်ပုံစံ
export function toApiInput(v: TransactionFormValues): TransactionInput {
  return {
    type: v.type,
    amount: Number(v.amount),
    date: new Date(v.date).toISOString(),
    categoryId: v.categoryId === '' ? null : Number(v.categoryId),
    note: v.note === '' ? null : v.note,
  };
}
