import type { Request, Response } from 'express';
import * as categoryService from '../services/category.service.js';
import { idParamSchema } from '../schemas/category.schema.js';
import { getUserId } from '../middleware/auth.js';

export async function listHandler(req: Request, res: Response) {
  const categories = await categoryService.listCategories(getUserId(req));
  res.json({ categories });
}

export async function createHandler(req: Request, res: Response) {
  const category = await categoryService.createCategory(
    getUserId(req),
    req.body,
  );
  res.status(201).json({ category });
}

export async function updateHandler(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const category = await categoryService.updateCategory(
    getUserId(req),
    id,
    req.body,
  );
  res.json({ category });
}

export async function deleteHandler(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await categoryService.deleteCategory(getUserId(req), id);
  res.status(204).send();
}
