import type { Request, Response } from 'express';
import * as transactionService from '../services/transaction.service.js';
import { listTransactionsQuerySchema } from '../schemas/transaction.schema.js';
import { idParamSchema } from '../schemas/common.schema.js';
import { getUserId } from '../middleware/auth.js';

export async function listHandler(req: Request, res: Response) {
  const query = listTransactionsQuerySchema.parse(req.query);
  const result = await transactionService.listTransactions(
    getUserId(req),
    query,
  );
  res.json(result);
}

export async function createHandler(req: Request, res: Response) {
  const transaction = await transactionService.createTransaction(
    getUserId(req),
    req.body,
  );
  res.status(201).json({ transaction });
}

export async function updateHandler(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const transaction = await transactionService.updateTransaction(
    getUserId(req),
    id,
    req.body,
  );
  res.json({ transaction });
}

export async function deleteHandler(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await transactionService.deleteTransaction(getUserId(req), id);
  res.status(204).send();
}
