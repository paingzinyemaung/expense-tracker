import { prisma } from '../lib/prisma.js';
import type { ByCategoryQuery, StatsQuery } from '../schemas/stats.schema.js';

export async function getSummary(userId: number, { from, to }: StatsQuery) {
  // type (INCOME/EXPENSE) အလိုက် အုပ်စုဖွဲ့ပြီး DB ထဲမှာပဲ ပေါင်း
  const rows = await prisma.transaction.groupBy({
    by: ['type'],
    where: { userId, date: { gte: from, lt: to } },
    _sum: { amount: true },
    _count: { _all: true },
  });

  const income = rows.find((r) => r.type === 'INCOME');
  const expense = rows.find((r) => r.type === 'EXPENSE');

  const incomeTotal = income?._sum.amount ?? 0; // မရှိရင် null မဟုတ်ဘဲ 0
  const expenseTotal = expense?._sum.amount ?? 0;

  return {
    income: incomeTotal,
    expense: expenseTotal,
    balance: incomeTotal - expenseTotal,
    count: (income?._count._all ?? 0) + (expense?._count._all ?? 0),
  };
}

export async function getByCategory(
  userId: number,
  { from, to, type }: ByCategoryQuery,
) {
  // ၁) category id အလိုက် စုစုပေါင်း (အများဆုံးအရင်)
  const groups = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId, type, date: { gte: from, lt: to } },
    _sum: { amount: true },
    _count: { _all: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  // ၂) ပါလာတဲ့ category တွေရဲ့ နာမည်၊ အရောင်ကို query တစ်ခုတည်းနဲ့ယူ
  const ids = groups
    .map((g) => g.categoryId)
    .filter((id): id is number => id !== null);

  const categories = await prisma.category.findMany({
    where: { userId, id: { in: ids } },
    select: { id: true, name: true, color: true },
  });
  const byId = new Map(categories.map((c) => [c.id, c]));

  // ၃) ပြန်ချိတ်
  return groups.map((g) => {
    const category = g.categoryId === null ? undefined : byId.get(g.categoryId);
    return {
      categoryId: g.categoryId,
      name: category?.name ?? 'Uncategorized',
      color: category?.color ?? '#9ca3af',
      total: g._sum.amount ?? 0,
      count: g._count._all,
    };
  });
}
