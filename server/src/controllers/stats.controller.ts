import type { Request, Response } from 'express';
import * as statsService from '../services/stats.service.js';
import {
  byCategoryQuerySchema,
  statsQuerySchema,
} from '../schemas/stats.schema.js';
import { getUserId } from '../middleware/auth.js';

export async function summaryHandler(req: Request, res: Response) {
  const query = statsQuerySchema.parse(req.query);
  const summary = await statsService.getSummary(getUserId(req), query);
  res.json({ summary });
}

export async function byCategoryHandler(req: Request, res: Response) {
  const query = byCategoryQuerySchema.parse(req.query);
  const items = await statsService.getByCategory(getUserId(req), query);
  res.json({ items });
}
