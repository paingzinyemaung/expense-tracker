import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getExpenseByCategory, getSummary } from './statsApi';

type Range = { from: string; to: string };

export function useSummary(range: Range) {
  return useQuery({
    queryKey: ['stats', 'summary', range],
    queryFn: () => getSummary(range),
    placeholderData: keepPreviousData,
  });
}

export function useExpenseByCategory(range: Range) {
  return useQuery({
    queryKey: ['stats', 'by-category', 'EXPENSE', range],
    queryFn: () => getExpenseByCategory(range),
    placeholderData: keepPreviousData,
  });
}
