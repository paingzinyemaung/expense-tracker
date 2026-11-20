import { formatAmount } from '../lib/format';

export type Slice = { id: string; label: string; color: string; value: number };

type Props = { slices: Slice[]; centerLabel: string };

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 251.3
const GAP = 1.2; // အပိုင်းများအကြား နေရာလွတ်

export default function DonutChart({ slices, centerLabel }: Props) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total <= 0) return null;

  // အပိုင်းတစ်ခုချင်းစီရဲ့ အရှည်နဲ့ စမယ့်နေရာ (ရှေ့အပိုင်းတွေရဲ့ ပေါင်းလဒ်)
  let accumulated = 0;
  const segments = slices.map((s) => {
    const length = (s.value / total) * CIRCUMFERENCE;
    const segment = { ...s, length, offset: accumulated };
    accumulated += length;
    return segment;
  });

  return (
    <div className="relative size-44 shrink-0">
      <svg
        viewBox="0 0 100 100"
        className="size-full -rotate-90"
        role="img"
        aria-label={`${centerLabel} ${formatAmount(total)} Ks`}
      >
        {/* နောက်ခံ ring */}
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth="14"
          className="stroke-base-200"
        />

        {segments.map((s) => (
          <circle
            key={s.id}
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={`${Math.max(s.length - GAP, 0.01)} ${CIRCUMFERENCE}`}
            strokeDashoffset={-s.offset}
          />
        ))}
      </svg>

      {/* အလယ်က စာသား */}
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="text-xs opacity-70">{centerLabel}</span>
        <span className="text-lg font-semibold tabular-nums">
          {formatAmount(total)}
        </span>
      </div>
    </div>
  );
}
