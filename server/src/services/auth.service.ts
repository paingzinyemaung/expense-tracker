import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema.js';

const SALT_ROUNDS = 10;

type DbUser = { id: number; email: string; name: string; createdAt: Date };

// passwordHash ကို client ဆီ ဘယ်တော့မှ မပို့ပါ
const toPublicUser = (u: DbUser) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  createdAt: u.createdAt,
});

export function signAccessToken(userId: number) {
  return jwt.sign({ sub: String(userId) }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
  });
}

export function verifyAccessToken(token: string): number {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  if (typeof payload === 'string' || !payload.sub) {
    throw new Error('Invalid token payload');
  }
  return Number(payload.sub);
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) throw new HttpError(409, 'Email already in use');

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
  });

  return { user: toPublicUser(user), accessToken: signAccessToken(user.id) };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const valid = user
    ? await bcrypt.compare(input.password, user.passwordHash)
    : false;

  // email မှားလား password မှားလား မခွဲပြောပါ (attacker ကို အချက်အလက်မပေး)
  if (!user || !valid) throw new HttpError(401, 'Invalid email or password');

  return { user: toPublicUser(user), accessToken: signAccessToken(user.id) };
}

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(401, 'User not found');
  return toPublicUser(user);
}
