import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema.js';

const SALT_ROUNDS = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

type DbUser = { id: number; email: string; name: string; createdAt: Date };

const toPublicUser = (u: DbUser) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  createdAt: u.createdAt,
});

// ---------- Access token ----------
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

// ---------- Refresh token ----------
const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

function generateRefreshToken() {
  const token = crypto.randomBytes(48).toString('base64url'); // cookie ထဲသွားမယ့် အစစ်
  return {
    token,
    tokenHash: hashToken(token), // DB ထဲသိမ်းမယ့် hash
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * DAY_MS),
  };
}

// login/register ပြီးရင် token နှစ်မျိုးလုံး ထုတ်ပေးတဲ့ function
async function startSession(user: DbUser) {
  const { token, tokenHash, expiresAt } = generateRefreshToken();
  await prisma.refreshToken.create({
    data: { tokenHash, userId: user.id, expiresAt },
  });
  return {
    user: toPublicUser(user),
    accessToken: signAccessToken(user.id),
    refreshToken: { token, expiresAt },
  };
}

// ---------- Use cases ----------
export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) throw new HttpError(409, 'Email already in use');

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
  });
  return startSession(user);
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const valid = user
    ? await bcrypt.compare(input.password, user.passwordHash)
    : false;
  if (!user || !valid) throw new HttpError(401, 'Invalid email or password');
  return startSession(user);
}

export async function refresh(rawToken: string | undefined) {
  if (!rawToken) throw new HttpError(401, 'Missing refresh token');

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } }); // သက်တမ်းကုန်တာ ရှင်း
    throw new HttpError(401, 'Invalid or expired refresh token');
  }

  // Rotation: အဟောင်းဖျက် + အသစ်ဖန်တီး ကို တစ်ပြိုင်နက် (နှစ်ခုလုံးအောင် သို့မဟုတ် နှစ်ခုလုံးမအောင်)
  const next = generateRefreshToken();
  await prisma.$transaction([
    prisma.refreshToken.deleteMany({ where: { id: stored.id } }),
    prisma.refreshToken.create({
      data: {
        tokenHash: next.tokenHash,
        userId: stored.userId,
        expiresAt: next.expiresAt,
      },
    }),
  ]);

  return {
    accessToken: signAccessToken(stored.userId),
    refreshToken: { token: next.token, expiresAt: next.expiresAt },
  };
}

export async function logout(rawToken: string | undefined) {
  if (!rawToken) return;
  await prisma.refreshToken.deleteMany({
    where: { tokenHash: hashToken(rawToken) },
  });
}

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(401, 'User not found');
  return toPublicUser(user);
}
