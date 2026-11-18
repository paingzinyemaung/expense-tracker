import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { refreshSession } from '../../lib/api';
import { setAccessToken } from '../../lib/tokenStore';
import * as authApi from './authApi';
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
} from './authContext';
import type { LoginValues, RegisterValues } from './schemas';
import type { User } from './types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus('unauthenticated');
    queryClient.clear(); // ယခင် user ရဲ့ cache ကိုရှင်း
  }, [queryClient]);

  // ① App စတင်ချိန် bootstrap: refresh → me
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshSession();
        const me = await authApi.getMe();
        if (!cancelled) {
          setUser(me);
          setStatus('authenticated');
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setStatus('unauthenticated');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ② Interceptor က "session ကုန်ပြီ" လို့ အကြောင်းကြားရင်
  useEffect(() => {
    window.addEventListener('auth:logout', clearSession);
    return () => window.removeEventListener('auth:logout', clearSession);
  }, [clearSession]);

  const login = useCallback(async (values: LoginValues) => {
    const { user, accessToken } = await authApi.login(values);
    setAccessToken(accessToken);
    setUser(user);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (values: RegisterValues) => {
    const { user, accessToken } = await authApi.register(values);
    setAccessToken(accessToken);
    setUser(user);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession(); // server ခေါ်တာ မအောင်လည်း client ဘက်ကတော့ logout ဖြစ်စေ
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
