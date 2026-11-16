import { prisma } from '../lib/prisma.js';
import { HttpError } from '../utils/httpError.js';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../schemas/category.schema.js';

// နာမည်ထပ်မနေရင် ပြီး၊ ထပ်နေရင် 409 (exceptId = ကိုယ်တိုင်ကိုတော့ မထည့်စစ်)
async function assertNameFree(userId: number, name: string, exceptId?: number) {
  const found = await prisma.category.findUnique({
    where: { userId_name: { userId, name } },
  });
  if (found && found.id !== exceptId) {
    throw new HttpError(409, 'Category name already exists');
  }
}

// ကိုယ့်ပိုင်ဆိုင်တဲ့ category ကိုပဲ ယူ၊ မရှိရင် 404 (ownership check)
async function getOwned(userId: number, id: number) {
  const category = await prisma.category.findFirst({ where: { id, userId } });
  if (!category) throw new HttpError(404, 'Category not found');
  return category;
}

export function listCategories(userId: number) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });
}

export async function createCategory(
  userId: number,
  input: CreateCategoryInput,
) {
  await assertNameFree(userId, input.name);
  return prisma.category.create({
    data: { userId, name: input.name, color: input.color },
  });
}

export async function updateCategory(
  userId: number,
  id: number,
  input: UpdateCategoryInput,
) {
  await getOwned(userId, id);
  if (input.name) await assertNameFree(userId, input.name, id);
  return prisma.category.update({ where: { id }, data: input });
}

export async function deleteCategory(userId: number, id: number) {
  await getOwned(userId, id);
  await prisma.category.delete({ where: { id } });
}
