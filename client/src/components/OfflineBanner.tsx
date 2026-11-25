import { useSyncExternalStore } from 'react';
import { WifiOff } from 'lucide-react';

function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

export default function OfflineBanner() {
  // browser ရဲ့ online/offline အခြေအနေကို React ထဲ ချိတ်ဆက်ဖတ်တာ
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
  if (online) return null;

  return (
    <div
      role="status"
      className="alert alert-warning alert-soft rounded-none py-2 text-sm"
    >
      <WifiOff className="size-4" aria-hidden />
      <span>အင်တာနက် မရှိပါ။ ဒေတာအသစ်များ မရနိုင်ပါ။</span>
    </div>
  );
}
