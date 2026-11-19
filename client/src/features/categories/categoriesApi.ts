import { api } from '../../lib/api';
import type { CategoryValues } from './schemas';
import type { Category } from './types';

export async function getCategories() {
  const res = await api.get<{ categories: Category[] }>('/categories');
  return res.data.categories;
}

export async function createCategory(values: CategoryValues) {
  const res = await api.post<{ category: Category }>('/categories', values);
  return res.data.category;
}

export async function updateCategory({
  id,
  values,
}: {
  id: number;
  values: CategoryValues;
}) {
  const res = await api.patch<{ category: Category }>(
    `/categories/${id}`,
    values,
  );
  return res.data.category;
}

export async function deleteCategory(id: number) {
  await api.delete(`/categories/${id}`);
}
