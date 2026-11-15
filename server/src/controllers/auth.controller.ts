import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { HttpError } from '../utils/httpError.js';
import {
  REFRESH_COOKIE,
  clearRefreshCookie,
  setRefreshCookie,
} from '../utils/cookies.js';

export async function registerHandler(req: Request, res: Response) {
  const { user, accessToken, refreshToken } = await authService.register(
    req.body,
  );
  setRefreshCookie(res, refreshToken.token, refreshToken.expiresAt);
  res.status(201).json({ user, accessToken }); // refresh token ကို body မှာ မပို့ပါ
}

export async function loginHandler(req: Request, res: Response) {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken.token, refreshToken.expiresAt);
  res.json({ user, accessToken });
}

export async function refreshHandler(req: Request, res: Response) {
  try {
    const { accessToken, refreshToken } = await authService.refresh(
      req.cookies?.[REFRESH_COOKIE],
    );
    setRefreshCookie(res, refreshToken.token, refreshToken.expiresAt);
    res.json({ accessToken });
  } catch (err) {
    clearRefreshCookie(res); // အသုံးမဝင်တော့တဲ့ cookie ကို browser ကနေ ဖျက်
    throw err;
  }
}

export async function logoutHandler(req: Request, res: Response) {
  await authService.logout(req.cookies?.[REFRESH_COOKIE]);
  clearRefreshCookie(res);
  res.status(204).send();
}

export async function meHandler(req: Request, res: Response) {
  if (!req.userId) throw new HttpError(401, 'Unauthorized');
  const user = await authService.getMe(req.userId);
  res.json({ user });
}
