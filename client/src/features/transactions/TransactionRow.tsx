import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatAmount, formatShortDate, formatTime } from '../../lib/format';
import type { Transaction } from './types';

const NO_CATEGORY_COLOR = '#9ca3af';

type Props = {
  t: Transaction;
  onClick?: (t: Transaction) => void;
  showDate?: boolean;
};

export default function TransactionRow({
  t,
  onClick,
  showDate = false,
}: Props) {
  const isIncome = t.type === 'INCOME';
  const color = t.category?.color ?? NO_CATEGORY_COLOR;

  const when = showDate
    ? `${formatShortDate(t.date)} ${formatTime(t.date)}`
    : formatTime(t.date);
  const title = t.note || t.category?.name || 'မှတ်တမ်း';
  const subtitle = [
    t.note ? (t.category?.name ?? 'အမျိုးအစားမရှိ') : null,
    when,
  ]
    .filter(Boolean)
    .join(' · ');

  const content = (
    <>
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

      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{title}</span>
        <span className="block truncate text-sm opacity-70">{subtitle}</span>
      </span>

      <span
        className={`shrink-0 font-semibold tabular-nums ${isIncome ? 'text-success' : 'text-error'}`}
      >
        {isIncome ? '+' : '−'}
        {formatAmount(t.amount)}
      </span>
    </>
  );

  const layout = 'flex w-full items-center gap-3 px-4 py-3 text-left';

  return (
    <li>
      {onClick ? (
        <button
          type="button"
          onClick={() => onClick(t)}
          className={`${layout} transition-colors hover:bg-base-200 active:bg-base-200`}
        >
          {content}
        </button>
      ) : (
        <div className={layout}>{content}</div>
      )}
    </li>
  );
}
