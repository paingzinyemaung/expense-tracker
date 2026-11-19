import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'နာမည်ထည့်ပါ')
    .max(30, 'နာမည်က ၃၀ လုံးထက် မကျော်ရ'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'အရောင်တစ်ခု ရွေးပါ'),
});

export type CategoryValues = z.infer<typeof categorySchema>;
