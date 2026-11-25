import { useMemo } from 'react';
import { Link } from 'react-router';
import { ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react';
import DonutChart, { type Slice } from '../components/DonutChart';
import { useAuth } from '../features/auth/useAuth';
import { useExpenseByCategory, useSummary } from '../features/stats/hooks';
import type { CategoryTotal } from '../features/stats/statsApi';
import { useRecentTransactions } from '../features/transactions/hooks';
import TransactionRow from '../features/transactions/TransactionRow';
import {
  currentYearMonth,
  formatAmount,
  formatMonthLabel,
  monthRange,
} from '../lib/format';
import InstallBanner from '../features/pwa/InstallBanner';

const MAX_SLICES = 5;
const OTHERS_COLOR = '#9ca3af';

// ထိပ်ဆုံး MAX_SLICES ခု + ကျန်တာကို "အခြား" အဖြစ် စုပေါင်း
function buildSlices(items: CategoryTotal[]): Slice[] {
  const sorted = [...items].sort((a, b) => b.total - a.total);
  const slices: Slice[] = sorted.slice(0, MAX_SLICES).map((i) => ({
    id: String(i.categoryId ?? 'none'),
    label: i.name,
    color: i.color,
    value: i.total,
  }));
  const othersTotal = sorted
    .slice(MAX_SLICES)
    .reduce((sum, i) => sum + i.total, 0);
  if (othersTotal > 0) {
    slices.push({
      id: 'others',
      label: 'အခြား',
      color: OTHERS_COLOR,
      value: othersTotal,
    });
  }
  return slices;
}

function InlineError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="alert alert-error alert-soft text-sm">
      <span>ဒေတာ မရနိုင်ပါ</span>
      <button className="btn btn-sm min-h-11" onClick={onRetry}>
        ထပ်ကြိုးစား
      </button>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const thisMonth = useMemo(() => currentYearMonth(), []);
  const range = useMemo(() => monthRange(thisMonth), [thisMonth]);

  const summary = useSummary(range);
  const byCategory = useExpenseByCategory(range);
  const recent = useRecentTransactions(5);

  const slices = useMemo(
    () => buildSlices(byCategory.data ?? []),
    [byCategory.data],
  );
  const slicesTotal = slices.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm opacity-70">မင်္ဂလာပါ</p>
          <h1 className="text-xl font-semibold">{user?.name}</h1>
        </div>
        <Link
          to="/transactions?add=1"
          className="btn btn-primary hidden min-h-11 lg:inline-flex"
        >
          <Plus className="size-5" aria-hidden />
          မှတ်တမ်းထည့်မည်
        </Link>
      </div>
      <InstallBanner />

      {/* ဒီလ အနှစ်ချုပ် */}
      {summary.isPending && (
        <div className="skeleton h-44 w-full rounded-box" />
      )}
      {summary.isError && <InlineError onRetry={() => summary.refetch()} />}
      {summary.data && (
        <section className="rounded-box bg-primary p-5 text-primary-content">
          <p className="text-sm opacity-80">
            {formatMonthLabel(thisMonth.year, thisMonth.month)} လက်ကျန်
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {formatAmount(summary.data.balance)}{' '}
            <span className="text-base font-normal opacity-80">Ks</span>
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-field bg-primary-content/10 p-3">
              <p className="flex items-center gap-1.5 text-sm opacity-90">
                <ArrowDownLeft className="size-4" aria-hidden />
                ဝင်ငွေ
              </p>
              <p className="mt-1 font-semibold tabular-nums">
                {formatAmount(summary.data.income)}
              </p>
            </div>
            <div className="rounded-field bg-primary-content/10 p-3">
              <p className="flex items-center gap-1.5 text-sm opacity-90">
                <ArrowUpRight className="size-4" aria-hidden />
                ထွက်ငွေ
              </p>
              <p className="mt-1 font-semibold tabular-nums">
                {formatAmount(summary.data.expense)}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ထွက်ငွေ - အမျိုးအစားအလိုက် */}
      <section className="space-y-3">
        <h2 className="font-semibold">ဒီလ ထွက်ငွေ (အမျိုးအစားအလိုက်)</h2>
        <div className="rounded-box border border-base-300 bg-base-100 p-4">
          {byCategory.isPending && (
            <div className="skeleton h-44 w-full rounded-box" />
          )}
          {byCategory.isError && (
            <InlineError onRetry={() => byCategory.refetch()} />
          )}
          {byCategory.data && slices.length === 0 && (
            <p className="py-6 text-center text-sm opacity-70">
              ဒီလ ထွက်ငွေ မရှိသေးပါ
            </p>
          )}
          {slices.length > 0 && (
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <DonutChart slices={slices} centerLabel="ထွက်ငွေ" />
              <ul className="w-full min-w-0 flex-1 space-y-2">
                {slices.map((s) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate">{s.label}</span>
                    <span className="tabular-nums">
                      {formatAmount(s.value)}
                    </span>
                    <span className="w-10 shrink-0 text-right text-sm tabular-nums opacity-70">
                      {Math.round((s.value / slicesTotal) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* နောက်ဆုံး မှတ်တမ်းများ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">နောက်ဆုံး မှတ်တမ်းများ</h2>
          <Link to="/transactions" className="link link-primary text-sm">
            အားလုံးကြည့်မည်
          </Link>
        </div>

        {recent.isPending && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-16 w-full rounded-box" />
            ))}
          </div>
        )}
        {recent.isError && <InlineError onRetry={() => recent.refetch()} />}
        {recent.data && recent.data.length === 0 && (
          <div className="rounded-box border border-dashed border-base-300 bg-base-100 p-6 text-center">
            <p className="font-medium">မှတ်တမ်း မရှိသေးပါ</p>
            <p className="mt-1 text-sm opacity-70">
              ပထမဆုံး မှတ်တမ်းကို ထည့်သွင်းလိုက်ပါ။
            </p>
          </div>
        )}
        {recent.data && recent.data.length > 0 && (
          <ul className="divide-y divide-base-300 overflow-hidden rounded-box border border-base-300 bg-base-100">
            {recent.data.map((t) => (
              <TransactionRow key={t.id} t={t} showDate />
            ))}
          </ul>
        )}
      </section>

      {/* ဖုန်းအတွက် FAB */}
      <Link
        to="/transactions?add=1"
        className="btn btn-primary btn-circle fixed right-4 bottom-28 z-20 size-14 shadow-lg lg:hidden"
        aria-label="မှတ်တမ်းအသစ် ထည့်မည်"
      >
        <Plus className="size-6" aria-hidden />
      </Link>
    </div>
  );
}
