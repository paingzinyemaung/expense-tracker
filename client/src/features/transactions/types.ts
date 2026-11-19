export type TransactionType = 'INCOME' | 'EXPENSE';

export type Transaction = {
  id: number;
  amount: number;
  type: TransactionType;
  note: string | null;
  date: string; // ISO (UTC)
  categoryId: number | null;
  category: { id: number; name: string; color: string } | null;
};

export type TransactionPage = {
  items: Transaction[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
