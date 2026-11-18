import { z } from 'zod';

const email = z
  .string()
  .trim()
  .min(1, 'Email ထည့်ပါ')
  .email('Email ပုံစံ မမှန်ပါ');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password ထည့်ပါ'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'နာမည်ထည့်ပါ')
      .max(50, 'နာမည်က ၅၀ လုံးထက် မကျော်ရ'),
    email,
    password: z
      .string()
      .min(8, 'Password အနည်းဆုံး ၈ လုံးရှိရမည်')
      .max(72, 'Password အရှည်လွန်းသည်'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Password နှစ်ခု မတူပါ',
    path: ['confirmPassword'], // error ကို confirmPassword field အောက်မှာပြ
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
