import { api } from '../../lib/api';
import type { TransactionPage, TransactionType } from './types';

export type TransactionQuery = {
  from: string;
  to: string;
  type?: TransactionType;
  categoryId?: number;
};

export async function getTransactionsPage(
  query: TransactionQuery,
  page: number,
) {
  const res = await api.get<TransactionPage>('/transactions', {
    params: { ...query, page, limit: 20 },
  });
  return res.data;
}
