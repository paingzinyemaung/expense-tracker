import { toDateKey } from '../../lib/format';
import type { Transaction } from './types';

export type DayGroup = { key: string; items: Transaction[] };

// Server က ရက်စွဲအသစ်ဆုံးအရင် စီပြီးသား၊ Map က ထည့်တဲ့အစဉ်ကို မှတ်ထားလို့ အစဉ်မပျက်
export function groupByDay(items: Transaction[]): DayGroup[] {
  const groups = new Map<string, DayGroup>();
  for (const t of items) {
    const key = toDateKey(t.date);
    const group = groups.get(key) ?? { key, items: [] };
    group.items.push(t);
    groups.set(key, group);
  }
  return [...groups.values()];
}
