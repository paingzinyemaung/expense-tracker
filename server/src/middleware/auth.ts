import type { Request, RequestHandler } from 'express';
import { HttpError } from '../utils/httpError.js';
import { verifyAccessToken } from '../services/auth.service.js';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new HttpError(401, 'Missing access token'));
    return;
  }
  try {
    req.userId = verifyAccessToken(header.slice(7));
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired token'));
  }
};

export function getUserId(req: Request): number {
  if (!req.userId) throw new HttpError(401, 'Unauthorized');
  return req.userId;
}
