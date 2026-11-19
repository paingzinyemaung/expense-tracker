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
