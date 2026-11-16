import type { ErrorRequestHandler } from 'express';
import { HttpError } from '../utils/httpError.js';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message, details: err.details });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      details: err.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
};
