const MONTHS_MY = [
  'ဇန်နဝါရီ',
  'ဖေဖော်ဝါရီ',
  'မတ်',
  'ဧပြီ',
  'မေ',
  'ဇွန်',
  'ဇူလိုင်',
  'ဩဂုတ်',
  'စက်တင်ဘာ',
  'အောက်တိုဘာ',
  'နိုဝင်ဘာ',
  'ဒီဇင်ဘာ',
];
const WEEKDAYS_MY = [
  'တနင်္ဂနွေ',
  'တနင်္လာ',
  'အင်္ဂါ',
  'ဗုဒ္ဓဟူး',
  'ကြာသပတေး',
  'သောကြာ',
  'စနေ',
];

const pad = (n: number) => String(n).padStart(2, '0');

export const formatAmount = (n: number) => n.toLocaleString('en-US');

export const formatMonthLabel = (year: number, month: number) =>
  `${MONTHS_MY[month]} ${year}`;

// "2026-11-19T05:00:00Z" → ကိုယ့်ဒေသအချိန်ရဲ့ ရက်စွဲ "2026-11-19"
export function toDateKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// "2026-11-19" → "19 နိုဝင်ဘာ 2026 · ကြာသပတေး"
export function formatDayLabel(dateKey: string) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const weekday = WEEKDAYS_MY[new Date(y, m - 1, d).getDay()];
  return `${d} ${MONTHS_MY[m - 1]} ${y} · ${weekday}`;
}

export function formatTime(iso: string) {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ---- လ တွက်ချက်ခြင်း (လ က 0 ကနေစ: ဇန်နဝါရီ = 0) ----
export type YearMonth = { year: number; month: number };

export const toMonthKey = ({ year, month }: YearMonth) =>
  `${year}-${pad(month + 1)}`;

export function parseMonth(value: string | null): YearMonth {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value ?? '');
  if (match) return { year: Number(match[1]), month: Number(match[2]) - 1 };
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function shiftMonth(
  { year, month }: YearMonth,
  delta: number,
): YearMonth {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

// ကိုယ့်ဒေသအချိန်ရဲ့ လအစ၊ လကုန် → UTC ISO
export function monthRange({ year, month }: YearMonth) {
  return {
    from: new Date(year, month, 1).toISOString(),
    to: new Date(year, month + 1, 1).toISOString(),
  };
}

// ISO (သို့) Date → <input type="datetime-local"> အတွက် "YYYY-MM-DDTHH:mm" (ကိုယ့်ဒေသအချိန်)
export function toDateTimeLocal(value: string | Date = new Date()) {
  const d = typeof value === 'string' ? new Date(value) : value;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const currentYearMonth = (): YearMonth => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
};

// "2026-11-19T05:00:00Z" → "19 နိုဝင်ဘာ"
export function formatShortDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_MY[d.getMonth()]}`;
}
