import { useEffect, useRef, type ReactNode } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  // open state ပြောင်းတိုင်း native dialog ကို ဖွင့်/ပိတ်
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal modal-bottom sm:modal-middle"
      onClose={onClose}
    >
      <div className="modal-box">
        <h2 className="text-lg font-semibold">{title}</h2>
        {/* ပွင့်နေချိန်မှသာ render → ဖွင့်တိုင်း form အသစ်၊ အဟောင်းတန်ဖိုး မကျန် */}
        <div className="mt-4">{open && children}</div>
      </div>
      {/* backdrop (အပြင်ကိုနှိပ်ရင် ပိတ်) */}
      <form method="dialog" className="modal-backdrop">
        <button aria-label="ပိတ်မည်">close</button>
      </form>
    </dialog>
  );
}
