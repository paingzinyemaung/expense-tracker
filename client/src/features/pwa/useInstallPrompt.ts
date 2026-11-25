import { useEffect, useState } from 'react';

// Chrome ရဲ့ beforeinstallprompt event (TypeScript မှာ standard type မပါ)
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault(); // browser ရဲ့ မူလ banner ကိုမပြစေ၊ ကိုယ်တိုင်ပြမယ်
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari ရဲ့ standalone flag
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  return {
    canInstall: deferred !== null && !installed && !isStandalone,
    install,
    isStandalone,
  };
}
