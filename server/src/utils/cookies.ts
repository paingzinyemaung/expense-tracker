import type { CookieOptions, Response } from 'express';
import { env } from '../config/env.js';

export const REFRESH_COOKIE = 'refreshToken';
const isProd = env.NODE_ENV === 'production';

const baseOptions: CookieOptions = {
  httpOnly: true, // JS က ဖတ်မရ
  secure: isProd, // production မှာ HTTPS ပေါ်မှာပဲ ပို့
  // sameSite: isProd ? 'none' : 'lax', // frontend/backend domain ခွဲတဲ့ deploy အတွက် (နောက်မှရှင်းမယ်)
  sameSite: 'lax',
  path: '/api/auth', // /api/auth/* ကိုပဲ cookie ပို့ (တခြား API မှာ မပါ)
};

export function setRefreshCookie(
  res: Response,
  token: string,
  expiresAt: Date,
) {
  res.cookie(REFRESH_COOKIE, token, { ...baseOptions, expires: expiresAt });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, baseOptions); // set လုပ်တုန်းက option အတိုင်းပဲ ဖျက်ရ
}
