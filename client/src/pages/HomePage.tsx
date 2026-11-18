import { useQuery } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../features/auth/useAuth';
import { api } from '../lib/api';

type Summary = {
  income: number;
  expense: number;
  balance: number;
  count: number;
};

const fmt = (n: number) => n.toLocaleString('en-US');

export default function HomePage() {
  const { user } = useAuth();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['stats', 'summary'],
    queryFn: async () => {
      const res = await api.get<{ summary: Summary }>('/stats/summary');
      return res.data.summary;
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm opacity-70">မင်္ဂလာပါ</p>
        <h1 className="text-xl font-semibold">{user?.name}</h1>
      </div>

      {isPending && <div className="skeleton h-44 w-full rounded-box" />}

      {isError && (
        <div role="alert" className="alert alert-error alert-soft">
          <span>ဒေတာ မရနိုင်ပါ</span>
          <button className="btn btn-sm min-h-11" onClick={() => refetch()}>
            ထပ်ကြိုးစား
          </button>
        </div>
      )}

      {data && (
        <>
          <section className="rounded-box bg-primary p-5 text-primary-content">
            <p className="text-sm opacity-80">လက်ကျန်ငွေ</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {fmt(data.balance)}{' '}
              <span className="text-base font-normal opacity-80">Ks</span>
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-field bg-primary-content/10 p-3">
                <p className="flex items-center gap-1.5 text-sm opacity-90">
                  <ArrowDownLeft className="size-4" aria-hidden />
                  ဝင်ငွေ
                </p>
                <p className="mt-1 font-semibold tabular-nums">
                  {fmt(data.income)}
                </p>
              </div>
              <div className="rounded-field bg-primary-content/10 p-3">
                <p className="flex items-center gap-1.5 text-sm opacity-90">
                  <ArrowUpRight className="size-4" aria-hidden />
                  ထွက်ငွေ
                </p>
                <p className="mt-1 font-semibold tabular-nums">
                  {fmt(data.expense)}
                </p>
              </div>
            </div>
          </section>

          {data.count === 0 && (
            <div className="rounded-box border border-dashed border-base-300 bg-base-100 p-6 text-center">
              <p className="font-medium">မှတ်တမ်း မရှိသေးပါ</p>
              <p className="mt-1 text-sm opacity-70">
                ပထမဆုံး ဝင်ငွေ/ထွက်ငွေ မှတ်တမ်းကို ထည့်သွင်းပြီး စတင်လိုက်ပါ။
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
