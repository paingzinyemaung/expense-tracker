import { api } from '../../lib/api';
import type {
  Transaction,
  TransactionInput,
  TransactionPage,
  TransactionType,
} from './types';
export type TransactionQuery = {
  from?: string;
  to?: string;
  type?: TransactionType;
  categoryId?: number;
};

export async function getTransactionsPage(
  query: TransactionQuery,
  page: number,
  limit = 20,
) {
  const res = await api.get<TransactionPage>('/transactions', {
    params: { ...query, page, limit },
  });
  return res.data;
}

export async function createTransaction(input: TransactionInput) {
  const res = await api.post<{ transaction: Transaction }>(
    '/transactions',
    input,
  );
  return res.data.transaction;
}

export async function updateTransaction({
  id,
  input,
}: {
  id: number;
  input: TransactionInput;
}) {
  const res = await api.patch<{ transaction: Transaction }>(
    `/transactions/${id}`,
    input,
  );
  return res.data.transaction;
}

export async function deleteTransaction(id: number) {
  await api.delete(`/transactions/${id}`);
}
