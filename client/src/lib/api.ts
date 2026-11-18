import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from './tokenStore';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export const api = axios.create({ baseURL, withCredentials: true });

// ① Request တိုင်းမှာ token ပါအောင်
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ② Refresh ကို တစ်ကြိမ်တည်းပဲ ခေါ်ပြီး ကျန်သူတွေက အဲ့ဒီ promise ကိုစောင့်
let refreshPromise: Promise<string> | null = null;

export function refreshSession(): Promise<string> {
  refreshPromise ??= axios
    // interceptor မပါတဲ့ axios ကိုသုံး (loop မဖြစ်အောင်)
    .post<{ accessToken: string }>(`${baseURL}/auth/refresh`, null, {
      withCredentials: true,
    })
    .then((res) => {
      setAccessToken(res.data.accessToken);
      return res.data.accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

// ③ 401 ရရင် refresh → မူလ request ကို ထပ်ပို့
const NO_RETRY_URLS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
];
type RetryConfig = InternalAxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const canRetry =
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      !NO_RETRY_URLS.includes(original.url ?? '');

    if (canRetry) {
      original._retried = true;
      try {
        await refreshSession();
        return api(original); // request interceptor က token အသစ်ကို ကိုယ်တိုင်ထည့်ပေး
      } catch {
        setAccessToken(null);
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  },
);
