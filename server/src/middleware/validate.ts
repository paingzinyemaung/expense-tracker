import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { HttpError } from '../utils/httpError.js';

export const validateBody =
  (schema: ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      next(new HttpError(400, 'Validation failed', details));
      return;
    }
    req.body = result.data;
    next();
  };
