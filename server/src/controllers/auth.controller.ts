import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { HttpError } from '../utils/httpError.js';

export async function registerHandler(req: Request, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json(result);
}

export async function loginHandler(req: Request, res: Response) {
  const result = await authService.login(req.body);
  res.json(result);
}

export async function meHandler(req: Request, res: Response) {
  if (!req.userId) throw new HttpError(401, 'Unauthorized');
  const user = await authService.getMe(req.userId);
  res.json({ user });
}
