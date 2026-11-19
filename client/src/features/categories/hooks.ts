import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import * as categoriesApi from './categoriesApi';

export const categoryKeys = { all: ['categories'] as const };

import type { Category } from './types';

// Category ပြောင်းရင် ဒေတာဟောင်းဖြစ်သွားနိုင်တဲ့ cache များ
const invalidateRelated = (qc: QueryClient) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: categoryKeys.all }),
    qc.invalidateQueries({ queryKey: ['transactions'] }),
    qc.invalidateQueries({ queryKey: ['stats'] }),
  ]);

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: categoriesApi.getCategories,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.updateCategory,
    onSuccess: () => invalidateRelated(qc),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.deleteCategory,

    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: categoryKeys.all });
      const previous = qc.getQueryData<Category[]>(categoryKeys.all);
      qc.setQueryData<Category[]>(categoryKeys.all, (old) =>
        old?.filter((c) => c.id !== id),
      );
      return { previous }; // onError ကို context အဖြစ် ပို့
    },

    onError: (_error, _id, context) => {
      if (context?.previous)
        qc.setQueryData(categoryKeys.all, context.previous);
    },

    onSettled: () => invalidateRelated(qc),
  });
}
