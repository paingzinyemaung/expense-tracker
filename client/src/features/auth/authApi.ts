import { api } from '../../lib/api';
import type { LoginValues, RegisterValues } from './schemas';
import type { User } from './types';

type AuthResponse = { user: User; accessToken: string };

export async function login(values: LoginValues) {
  const res = await api.post<AuthResponse>('/auth/login', values);
  return res.data;
}

export async function register(values: RegisterValues) {
  const { name, email, password } = values; // confirmPassword ကို မပို့
  const res = await api.post<AuthResponse>('/auth/register', {
    name,
    email,
    password,
  });
  return res.data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function getMe() {
  const res = await api.get<{ user: User }>('/auth/me');
  return res.data.user;
}
