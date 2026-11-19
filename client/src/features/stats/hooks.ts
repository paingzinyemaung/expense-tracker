import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getSummary } from './statsApi';

export function useSummary(range: { from: string; to: string }) {
  return useQuery({
    queryKey: ['stats', 'summary', range],
    queryFn: () => getSummary(range),
    placeholderData: keepPreviousData,
  });
}
