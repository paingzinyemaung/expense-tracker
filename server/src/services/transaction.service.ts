import { prisma } from '../lib/prisma.js';
import { HttpError } from '../utils/httpError.js';
import type {
  CreateTransactionInput,
  ListTransactionsQuery,
  UpdateTransactionInput,
} from '../schemas/transaction.schema.js';

// response ထဲမှာ category ရဲ့ လိုအပ်တဲ့ field သုံးခုပဲ ထည့်ပေး
const withCategory = {
  category: { select: { id: true, name: true, color: true } },
} as const;

// categoryId ပါလာရင် ကိုယ့် category ဟုတ်မဟုတ် စစ်
async function assertCategoryOwned(
  userId: number,
  categoryId: number | null | undefined,
) {
  if (categoryId == null) return; // မပါ / null ဆိုရင် စစ်စရာမလို
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });
  if (!category) throw new HttpError(400, 'Category does not exist');
}

// ကိုယ့် transaction ကိုပဲ ယူ၊ မရှိရင် 404
async function getOwned(userId: number, id: number) {
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
  });
  if (!transaction) throw new HttpError(404, 'Transaction not found');
  return transaction;
}

export async function listTransactions(
  userId: number,
  query: ListTransactionsQuery,
) {
  const { from, to, type, categoryId, page, limit } = query;

  // undefined ဖြစ်တဲ့ condition တွေကို Prisma က အလိုအလျောက် ကျော်
  const where = {
    userId,
    type,
    categoryId,
    date: { gte: from, lt: to },
  };

  const [items, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      include: withCategory,
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
}

export async function createTransaction(
  userId: number,
  input: CreateTransactionInput,
) {
  await assertCategoryOwned(userId, input.categoryId);
  return prisma.transaction.create({
    data: {
      userId,
      amount: input.amount,
      type: input.type,
      date: input.date,
      note: input.note,
      categoryId: input.categoryId,
    },
    include: withCategory,
  });
}

export async function updateTransaction(
  userId: number,
  id: number,
  input: UpdateTransactionInput,
) {
  await getOwned(userId, id);
  await assertCategoryOwned(userId, input.categoryId);
  return prisma.transaction.update({
    where: { id },
    data: input,
    include: withCategory,
  });
}

export async function deleteTransaction(userId: number, id: number) {
  await getOwned(userId, id);
  await prisma.transaction.delete({ where: { id } });
}
