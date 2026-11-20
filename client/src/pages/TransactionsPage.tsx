import { useEffect, useMemo, useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import Modal from '../components/Modal';
import { useCategories } from '../features/categories/hooks';
import { useSummary } from '../features/stats/hooks';
import { groupByDay } from '../features/transactions/group';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from '../features/transactions/hooks';
import MonthPicker from '../features/transactions/MonthPicker';
import TransactionForm from '../features/transactions/TransactionForm';
import TransactionRow from '../features/transactions/TransactionRow';
import type {
  Transaction,
  TransactionInput,
} from '../features/transactions/types';
import {
  useTransactionFilters,
  type TypeFilter,
} from '../features/transactions/useTransactionFilters';
import { getErrorMessage } from '../lib/errors';
import { formatAmount, formatDayLabel } from '../lib/format';
import { useSearchParams } from 'react-router';

const TYPE_TABS: { value: TypeFilter; label: string }[] = [
  { value: 'ALL', label: 'အားလုံး' },
  { value: 'EXPENSE', label: 'ထွက်ငွေ' },
  { value: 'INCOME', label: 'ဝင်ငွေ' },
];

type Editing = Transaction | 'new' | null; // null = ပိတ်၊ "new" = အသစ်၊ Transaction = ပြင်

function Stat({
  label,
  value,
  tone = '',
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div>
      <p className="text-xs opacity-70">{label}</p>
      <p className={`mt-0.5 font-semibold tabular-nums ${tone}`}>
        {formatAmount(value)}
      </p>
    </div>
  );
}

export default function TransactionsPage() {
  const filters = useTransactionFilters();
  const categories = useCategories();
  const summary = useSummary(filters.range);
  const {
    data,
    isPending,
    isError,
    isPlaceholderData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useTransactions(filters.query);

  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const remove = useDeleteTransaction();

  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  // ပင်မစာမျက်နှာက "/transactions?add=1" နဲ့ လာရင် form ကိုဖွင့်၊ param ကိုဖျက် (F5 နှိပ်ရင် ထပ်မပွင့်စေ)
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('add') !== '1') return;
    setEditing('new');
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('add');
        return next;
      },
      { replace: true },
    );
  }, [searchParams, setSearchParams]);

  const editingTransaction =
    editing !== null && editing !== 'new' ? editing : undefined;
  const groups = useMemo(
    () => groupByDay(data?.pages.flatMap((p) => p.items) ?? []),
    [data],
  );
  const total = data?.pages[0]?.total ?? 0;

  async function handleSave(input: TransactionInput) {
    if (editing === 'new') await create.mutateAsync(input);
    else if (editing) await update.mutateAsync({ id: editing.id, input });

    // ရွေးထားတဲ့ရက်က ကြည့်နေတဲ့လ မဟုတ်ရင် အဲ့ဒီလကို ကူးပြ
    const saved = new Date(input.date);
    const target = { year: saved.getFullYear(), month: saved.getMonth() };
    if (
      target.year !== filters.yearMonth.year ||
      target.month !== filters.yearMonth.month
    ) {
      filters.setMonth(target);
    }
    setEditing(null);
  }

  function askDelete(transaction: Transaction) {
    remove.reset();
    setEditing(null); // ပြင်တဲ့ sheet ကိုပိတ်ပြီး အတည်ပြု sheet ကိုဖွင့်
    setDeleting(transaction);
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      // error ကို modal ထဲမှာ remove.error နဲ့ ပြထားပြီး
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">မှတ်တမ်းများ</h1>
        <button
          className="btn btn-primary hidden min-h-11 lg:inline-flex"
          onClick={() => setEditing('new')}
        >
          <Plus className="size-5" aria-hidden />
          မှတ်တမ်းထည့်မည်
        </button>
      </div>

      <MonthPicker value={filters.yearMonth} onChange={filters.setMonth} />

      {summary.data ? (
        <section className="grid grid-cols-3 divide-x divide-base-300 rounded-box border border-base-300 bg-base-100 py-3 text-center">
          <Stat
            label="ဝင်ငွေ"
            value={summary.data.income}
            tone="text-success"
          />
          <Stat
            label="ထွက်ငွေ"
            value={summary.data.expense}
            tone="text-error"
          />
          <Stat label="လက်ကျန်" value={summary.data.balance} />
        </section>
      ) : (
        <div className="skeleton h-18 w-full rounded-box" />
      )}

      <div className="space-y-3">
        <div role="tablist" className="tabs tabs-box w-full">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={filters.type === tab.value}
              className={`tab min-h-11 flex-1 ${filters.type === tab.value ? 'tab-active' : ''}`}
              onClick={() => filters.setType(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          className="select w-full text-base"
          value={filters.categoryId ?? ''}
          onChange={(e) =>
            filters.setCategoryId(
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
          aria-label="အမျိုးအစားအလိုက် စစ်ထုတ်ရန်"
        >
          <option value="">အမျိုးအစား အားလုံး</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {isPending && (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-16 w-full rounded-box" />
          ))}
        </div>
      )}

      {isError && (
        <div role="alert" className="alert alert-error alert-soft">
          <span>မှတ်တမ်းများ ရယူလို့မရပါ</span>
          <button className="btn btn-sm min-h-11" onClick={() => refetch()}>
            ထပ်ကြိုးစား
          </button>
        </div>
      )}

      {data && groups.length === 0 && (
        <div className="rounded-box border border-dashed border-base-300 bg-base-100 p-8 text-center">
          <Receipt className="mx-auto size-8 opacity-40" aria-hidden />
          <p className="mt-3 font-medium">မှတ်တမ်း မရှိပါ</p>
          <p className="mt-1 text-sm opacity-70">
            ဒီလ (သို့) ဒီစစ်ထုတ်ချက်အတွက် မှတ်တမ်း မတွေ့ပါ။
          </p>
          <button
            className="btn btn-primary mt-4 min-h-11"
            onClick={() => setEditing('new')}
          >
            မှတ်တမ်းထည့်မည်
          </button>
        </div>
      )}

      {groups.length > 0 && (
        <div
          className={`space-y-4 transition-opacity ${isPlaceholderData ? 'opacity-50' : ''}`}
        >
          <p className="px-1 text-sm opacity-70">စုစုပေါင်း {total} ခု</p>

          {groups.map((g) => (
            <section key={g.key}>
              <h2 className="mb-1.5 px-1 text-sm font-medium opacity-70">
                {formatDayLabel(g.key)}
              </h2>
              <ul className="divide-y divide-base-300 overflow-hidden rounded-box border border-base-300 bg-base-100">
                {g.items.map((t) => (
                  <TransactionRow key={t.id} t={t} onClick={setEditing} />
                ))}
              </ul>
            </section>
          ))}

          {hasNextPage && (
            <button
              className="btn btn-outline btn-block min-h-11"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage && (
                <span className="loading loading-spinner loading-sm" />
              )}
              ထပ်ကြည့်မည်
            </button>
          )}
        </div>
      )}

      {/* ဖုန်းအတွက် FAB */}
      <button
        className="btn btn-primary btn-circle fixed right-4 bottom-28 z-20 size-14 shadow-lg lg:hidden"
        onClick={() => setEditing('new')}
        aria-label="မှတ်တမ်းအသစ် ထည့်မည်"
      >
        <Plus className="size-6" aria-hidden />
      </button>

      {/* ထည့်/ပြင် sheet */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'မှတ်တမ်းအသစ်' : 'မှတ်တမ်း ပြင်ဆင်မည်'}
      >
        <TransactionForm
          transaction={editingTransaction}
          onSubmit={handleSave}
          onCancel={() => setEditing(null)}
          onDelete={
            editingTransaction ? () => askDelete(editingTransaction) : undefined
          }
        />
      </Modal>

      {/* ဖျက်ရန် အတည်ပြုချက် */}
      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="ဖျက်မလား?"
      >
        <p className="text-sm">
          {deleting &&
            `${deleting.note || deleting.category?.name || 'ဒီမှတ်တမ်း'} (${formatAmount(deleting.amount)} Ks)`}{' '}
          ကို ဖျက်မှာ သေချာလား? ပြန်ယူလို့ မရပါဘူး။
        </p>
        {remove.isError && (
          <div
            role="alert"
            className="alert alert-error alert-soft mt-3 text-sm"
          >
            {getErrorMessage(remove.error)}
          </div>
        )}
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
            disabled={remove.isPending}
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
