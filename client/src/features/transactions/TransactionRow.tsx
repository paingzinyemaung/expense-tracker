import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatAmount, formatTime } from '../../lib/format';
import type { Transaction } from './types';

const NO_CATEGORY_COLOR = '#9ca3af';

export default function TransactionRow({ t }: { t: Transaction }) {
  const isIncome = t.type === 'INCOME';
  const color = t.category?.color ?? NO_CATEGORY_COLOR;

  const title = t.note || t.category?.name || 'မှတ်တမ်း';
  const subtitle = [
    t.note ? (t.category?.name ?? 'အမျိုးအစားမရှိ') : null,
    formatTime(t.date),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span
        className="grid size-10 shrink-0 place-items-center rounded-full"
        style={{
          color,
          backgroundColor: `color-mix(in oklab, ${color} 18%, transparent)`,
        }}
        aria-hidden
      >
        {isIncome ? (
          <ArrowDownLeft className="size-5" />
        ) : (
          <ArrowUpRight className="size-5" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{title}</p>
        <p className="truncate text-sm opacity-70">{subtitle}</p>
      </div>

      <p
        className={`shrink-0 font-semibold tabular-nums ${isIncome ? 'text-success' : 'text-error'}`}
      >
        {isIncome ? '+' : '−'}
        {formatAmount(t.amount)}
      </p>
    </li>
  );
}
