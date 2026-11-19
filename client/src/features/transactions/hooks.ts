import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { getTransactionsPage, type TransactionQuery } from './transactionsApi';

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (query: TransactionQuery) => ['transactions', 'list', query] as const,
};

export function useTransactions(query: TransactionQuery) {
  return useInfiniteQuery({
    queryKey: transactionKeys.list(query),
    queryFn: ({ pageParam }) => getTransactionsPage(query, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });
}
