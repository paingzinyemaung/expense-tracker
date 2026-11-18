import { isAxiosError } from 'axios';

export function getErrorMessage(
  error: unknown,
  fallback = 'တစ်ခုခု မှားယွင်းသွားပါသည်',
): string {
  if (isAxiosError(error)) {
    if (!error.response) return 'Server ကို မချိတ်နိုင်ပါ။ အင်တာနက်ကို စစ်ပါ။';
    const data = error.response.data as { message?: string } | undefined;
    return data?.message ?? fallback;
  }
  return fallback;
}
