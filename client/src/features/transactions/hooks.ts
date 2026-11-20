import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import {
  createTransaction,
  deleteTransaction,
  getTransactionsPage,
  updateTransaction,
  type TransactionQuery,
} from './transactionsApi';

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

// ရက်စွဲ filter မပါ၊ နောက်ဆုံး limit ခု (Dashboard အတွက်)
export function useRecentTransactions(limit = 5) {
  return useQuery({
    queryKey: [...transactionKeys.all, 'recent', limit],
    queryFn: () => getTransactionsPage({}, 1, limit),
    select: (page) => page.items,
  });
}

// မှတ်တမ်းပြောင်းရင် စာရင်းနဲ့ အနှစ်ချုပ် (Dashboard အပါအဝင်) cache အားလုံး အသစ်ဖြစ်ရမယ်
const invalidateAfterChange = (qc: QueryClient) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: transactionKeys.all }),
    qc.invalidateQueries({ queryKey: ['stats'] }),
  ]);

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => invalidateAfterChange(qc),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateTransaction,
    onSuccess: () => invalidateAfterChange(qc),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => invalidateAfterChange(qc),
  });
}
