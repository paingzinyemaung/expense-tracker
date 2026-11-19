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

// Server ဆီ ပို့မယ့် ပုံစံ
export type TransactionInput = {
  type: TransactionType;
  amount: number;
  date: string; // ISO (UTC)
  note: string | null;
  categoryId: number | null;
};
