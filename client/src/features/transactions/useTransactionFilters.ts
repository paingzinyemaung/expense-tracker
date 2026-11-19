import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import {
  monthRange,
  parseMonth,
  toMonthKey,
  type YearMonth,
} from '../../lib/format';
import type { TransactionQuery } from './transactionsApi';

export type TypeFilter = 'ALL' | 'INCOME' | 'EXPENSE';

export function useTransactionFilters() {
  const [params, setParams] = useSearchParams();

  const yearMonth = parseMonth(params.get('month'));
  const { year, month } = yearMonth;

  const typeParam = params.get('type');
  const type: TypeFilter =
    typeParam === 'INCOME' || typeParam === 'EXPENSE' ? typeParam : 'ALL';

  const categoryNumber = Number(params.get('category'));
  const categoryId =
    Number.isInteger(categoryNumber) && categoryNumber > 0
      ? categoryNumber
      : undefined;

  // key အလိုက် ထည့်/ဖယ် (null = ဖယ်)
  function update(changes: Record<string, string | null>) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(changes)) {
          if (value === null) next.delete(key);
          else next.set(key, value);
        }
        return next;
      },
      { replace: true },
    );
  }

  const range = useMemo(() => monthRange({ year, month }), [year, month]);

  const query = useMemo<TransactionQuery>(
    () => ({ ...range, type: type === 'ALL' ? undefined : type, categoryId }),
    [range, type, categoryId],
  );

  return {
    yearMonth,
    type,
    categoryId,
    range,
    query,
    setMonth: (next: YearMonth) => update({ month: toMonthKey(next) }),
    setType: (next: TypeFilter) =>
      update({ type: next === 'ALL' ? null : next }),
    setCategoryId: (id: number | undefined) =>
      update({ category: id === undefined ? null : String(id) }),
  };
}
