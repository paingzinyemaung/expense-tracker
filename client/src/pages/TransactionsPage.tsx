import { useMemo } from 'react';
import { Receipt } from 'lucide-react';
import { useCategories } from '../features/categories/hooks';
import { useSummary } from '../features/stats/hooks';
import { groupByDay } from '../features/transactions/group';
import { useTransactions } from '../features/transactions/hooks';
import MonthPicker from '../features/transactions/MonthPicker';
import TransactionRow from '../features/transactions/TransactionRow';
import {
  useTransactionFilters,
  type TypeFilter,
} from '../features/transactions/useTransactionFilters';
import { formatAmount, formatDayLabel } from '../lib/format';

const TYPE_TABS: { value: TypeFilter; label: string }[] = [
  { value: 'ALL', label: 'အားလုံး' },
  { value: 'EXPENSE', label: 'ထွက်ငွေ' },
  { value: 'INCOME', label: 'ဝင်ငွေ' },
];

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

  const groups = useMemo(
    () => groupByDay(data?.pages.flatMap((p) => p.items) ?? []),
    [data],
  );
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">မှတ်တမ်းများ</h1>

      <MonthPicker value={filters.yearMonth} onChange={filters.setMonth} />

      {/* ဒီလရဲ့ အနှစ်ချုပ် */}
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
        <div className="skeleton h-[4.5rem] w-full rounded-box" />
      )}

      {/* Filter များ */}
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

      {/* စာရင်း */}
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
                  <TransactionRow key={t.id} t={t} />
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
    </div>
  );
}
