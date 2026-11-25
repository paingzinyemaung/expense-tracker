import { Download } from 'lucide-react';
import { useInstallPrompt } from './useInstallPrompt';

export default function InstallBanner() {
  const { canInstall, install } = useInstallPrompt();
  if (!canInstall) return null;

  return (
    <div className="flex items-center gap-3 rounded-box border border-base-300 bg-base-100 p-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-field bg-primary/10 text-primary">
        <Download className="size-5" aria-hidden />
      </span>
      <p className="min-w-0 flex-1 text-sm">
        Home Screen မှာ app အဖြစ် ထည့်သွင်းပြီး ပိုမြန်မြန် ဖွင့်ပါ
      </p>
      <button className="btn btn-primary btn-sm min-h-11" onClick={install}>
        ထည့်သွင်းမည်
      </button>
    </div>
  );
}
