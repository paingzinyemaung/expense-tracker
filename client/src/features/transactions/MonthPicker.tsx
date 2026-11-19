import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthLabel, shiftMonth, type YearMonth } from '../../lib/format';

type Props = { value: YearMonth; onChange: (next: YearMonth) => void };

export default function MonthPicker({ value, onChange }: Props) {
  const now = new Date();
  const isCurrentMonth =
    value.year === now.getFullYear() && value.month === now.getMonth();
  const isFuture =
    value.year > now.getFullYear() ||
    (value.year === now.getFullYear() && value.month > now.getMonth());

  return (
    <div className="flex items-center justify-between rounded-box border border-base-300 bg-base-100 p-1">
      <button
        className="btn btn-ghost btn-square min-h-11 min-w-11"
        onClick={() => onChange(shiftMonth(value, -1))}
        aria-label="ပြီးခဲ့သောလ"
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <p className="font-medium">{formatMonthLabel(value.year, value.month)}</p>
      <button
        className="btn btn-ghost btn-square min-h-11 min-w-11"
        onClick={() => onChange(shiftMonth(value, 1))}
        disabled={isCurrentMonth || isFuture}
        aria-label="နောက်လ"
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>
    </div>
  );
}
