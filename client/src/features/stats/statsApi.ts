import { api } from '../../lib/api';

export type Summary = {
  income: number;
  expense: number;
  balance: number;
  count: number;
};

export async function getSummary(range: { from: string; to: string }) {
  const res = await api.get<{ summary: Summary }>('/stats/summary', {
    params: range,
  });
  return res.data.summary;
}

export type CategoryTotal = {
  categoryId: number | null;
  name: string;
  color: string;
  total: number;
  count: number;
};

export async function getExpenseByCategory(range: {
  from: string;
  to: string;
}) {
  const res = await api.get<{ items: CategoryTotal[] }>('/stats/by-category', {
    params: { ...range, type: 'EXPENSE' },
  });
  return res.data.items;
}
