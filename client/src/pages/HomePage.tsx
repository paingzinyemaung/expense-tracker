import { useQuery } from '@tanstack/react-query';
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
  const { user, logout } = useAuth();

  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: ['stats', 'summary'],
    queryFn: async () => {
      const res = await api.get<{ summary: Summary }>('/stats/summary');
      return res.data.summary;
    },
  });

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md space-y-4 bg-base-100 p-4 md:max-w-2xl">
      <header className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm opacity-70">မင်္ဂလာပါ</p>
          <h1 className="text-xl font-semibold">{user?.name}</h1>
        </div>
        <button
          className="btn btn-outline btn-sm min-h-11"
          onClick={() => logout()}
        >
          ထွက်မည်
        </button>
      </header>

      {isPending && <span className="loading loading-spinner text-primary" />}
      {isError && (
        <div role="alert" className="alert alert-error alert-soft">
          <span>ဒေတာ မရနိုင်ပါ</span>
          <button className="btn btn-sm" onClick={() => refetch()}>
            ထပ်ကြိုးစား
          </button>
        </div>
      )}

      {data && (
        <section className="grid gap-3 sm:grid-cols-3">
          <div className="card border border-base-300">
            <div className="card-body gap-0 p-4">
              <p className="text-sm opacity-70">ဝင်ငွေ</p>
              <p className="text-xl font-semibold tabular-nums text-success">
                {fmt(data.income)}
              </p>
            </div>
          </div>
          <div className="card border border-base-300">
            <div className="card-body gap-0 p-4">
              <p className="text-sm opacity-70">ထွက်ငွေ</p>
              <p className="text-xl font-semibold tabular-nums text-error">
                {fmt(data.expense)}
              </p>
            </div>
          </div>
          <div className="card border border-base-300">
            <div className="card-body gap-0 p-4">
              <p className="text-sm opacity-70">လက်ကျန်</p>
              <p className="text-xl font-semibold tabular-nums">
                {fmt(data.balance)}
              </p>
            </div>
          </div>
        </section>
      )}

      <button
        className="btn btn-primary btn-block min-h-11"
        onClick={() => refetch()}
        disabled={isFetching}
      >
        {isFetching && <span className="loading loading-spinner loading-sm" />}
        ဒေတာ ပြန်ခေါ်မည်
      </button>
    </main>
  );
}
