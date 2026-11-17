import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // မအောင်မြင်ရင် တစ်ကြိမ်ပဲ ထပ်ကြိုးစား
      refetchOnWindowFocus: false, // tab ပြန်ရောက်တိုင်း အလိုအလျောက် ပြန်မခေါ်
      staleTime: 30_000, // ၃၀ စက္ကန့်အတွင်းဆိုရင် cache ထဲကဟာကို "လတ်ဆတ်ဆဲ" လို့ယူ
    },
  },
});
