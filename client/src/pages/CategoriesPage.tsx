import { useState, useEffect } from 'react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import CategoryForm from '../features/categories/CategoryForm';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '../features/categories/hooks';
import type { CategoryValues } from '../features/categories/schemas';
import type { Category } from '../features/categories/types';
import { getErrorMessage } from '../lib/errors';

type Editing = Category | 'new' | null; // null = ပိတ်ထား၊ "new" = အသစ်ထည့်၊ Category = ပြင်

export default function CategoriesPage() {
  const { data, isPending, isError, refetch } = useCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const remove = useDeleteCategory();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const editingCategory =
    editing !== null && editing !== 'new' ? editing : undefined;

  async function handleSave(values: CategoryValues) {
    if (editing === 'new') await create.mutateAsync(values);
    else if (editing) await update.mutateAsync({ id: editing.id, values });
    setEditing(null); // အောင်မြင်မှ sheet ကိုပိတ်
  }

  function openDelete(category: Category) {
    remove.reset(); // ယခင် delete error ကို ရှင်း
    setDeleting(category);
  }

  function confirmDelete() {
    if (!deleting) return;
    remove.mutate(deleting.id, {
      onError: (e) => setToast(getErrorMessage(e, 'ဖျက်လို့မရပါ')),
    });
    setDeleting(null); // ချက်ချင်းပိတ်
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="toast toast-center z-30 mb-20 lg:mb-0">
          <div role="alert" className="alert alert-error">
            <span>{toast}</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">အမျိုးအစားများ</h1>
          <p className="text-sm opacity-70">ဝင်ငွေ၊ ထွက်ငွေကို အုပ်စုဖွဲ့ရန်</p>
        </div>
        <button
          className="btn btn-primary hidden min-h-11 lg:inline-flex"
          onClick={() => setEditing('new')}
        >
          <Plus className="size-5" aria-hidden />
          အသစ်ထည့်မည်
        </button>
      </div>

      {isPending && (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-14 w-full rounded-box" />
          ))}
        </div>
      )}

      {isError && (
        <div role="alert" className="alert alert-error alert-soft">
          <span>အမျိုးအစားများ ရယူလို့မရပါ</span>
          <button className="btn btn-sm min-h-11" onClick={() => refetch()}>
            ထပ်ကြိုးစား
          </button>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="rounded-box border border-dashed border-base-300 bg-base-100 p-8 text-center">
          <Tags className="mx-auto size-8 opacity-40" aria-hidden />
          <p className="mt-3 font-medium">အမျိုးအစား မရှိသေးပါ</p>
          <p className="mt-1 text-sm opacity-70">
            စားသောက်၊ သွားလာ၊ လစာ စသဖြင့် အုပ်စုတွေ ဖန်တီးပါ။
          </p>
          <button
            className="btn btn-primary mt-4 min-h-11"
            onClick={() => setEditing('new')}
          >
            ပထမဆုံး အမျိုးအစား ထည့်မည်
          </button>
        </div>
      )}

      {data && data.length > 0 && (
        <ul className="divide-y divide-base-300 overflow-hidden rounded-box border border-base-300 bg-base-100">
          {data.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-1.5 pr-2 pl-4">
              <span
                className="size-3.5 shrink-0 rounded-full"
                style={{ backgroundColor: c.color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{c.name}</span>
              <button
                className="btn btn-ghost btn-square min-h-11 min-w-11"
                onClick={() => setEditing(c)}
                aria-label={`${c.name} ကို ပြင်မည်`}
              >
                <Pencil className="size-4" aria-hidden />
              </button>
              <button
                className="btn btn-ghost btn-square min-h-11 min-w-11 text-error"
                onClick={() => openDelete(c)}
                aria-label={`${c.name} ကို ဖျက်မည်`}
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ဖုန်းအတွက် FAB (လက်မရောက်တဲ့ နေရာ) */}
      <button
        className="btn btn-primary btn-circle fixed right-4 bottom-28 z-20 size-14 shadow-lg lg:hidden"
        onClick={() => setEditing('new')}
        aria-label="အမျိုးအစား အသစ်ထည့်မည်"
      >
        <Plus className="size-6" aria-hidden />
      </button>

      {/* ထည့်/ပြင် sheet */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'အမျိုးအစား အသစ်' : 'အမျိုးအစား ပြင်ဆင်မည်'}
      >
        <CategoryForm
          category={editingCategory}
          onSubmit={handleSave}
          onCancel={() => setEditing(null)}
        />
      </Modal>

      {/* ဖျက်ရန် အတည်ပြုချက် */}
      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="ဖျက်မလား?"
      >
        <p className="text-sm">
          “{deleting?.name}” ကို ဖျက်မှာ သေချာလား? ဒီအမျိုးအစားနဲ့ မှတ်တမ်းတွေ{' '}
          <strong>မပျက်ပါဘူး</strong>၊ “အမျိုးအစားမရှိ” အဖြစ် ပြောင်းသွားပါမယ်။
        </p>
        {/* {remove.isError && (
          <div
            role="alert"
            className="alert alert-error alert-soft mt-3 text-sm"
          >
            {getErrorMessage(remove.error)}
          </div>
        )} */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            className="btn min-h-11"
            onClick={() => setDeleting(null)}
            disabled={remove.isPending}
          >
            မဖျက်တော့ပါ
          </button>
          <button
            className="btn btn-error min-h-11"
            onClick={confirmDelete}
            // disabled={remove.isPending}
          >
            {remove.isPending && (
              <span className="loading loading-spinner loading-sm" />
            )}
            ဖျက်မည်
          </button>
        </div>
      </Modal>
    </div>
  );
}
