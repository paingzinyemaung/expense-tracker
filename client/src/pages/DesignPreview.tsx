import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

const swatches = [
  { label: 'Primary', cls: 'bg-primary text-primary-content' },
  { label: 'Secondary', cls: 'bg-secondary text-secondary-content' },
  { label: 'Accent', cls: 'bg-accent text-accent-content' },
  { label: 'Income', cls: 'bg-success text-success-content' },
  { label: 'Expense', cls: 'bg-error text-error-content' },
  { label: 'Surface', cls: 'bg-base-300 text-base-content' },
];

function ServerStatus() {
  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.get<{ status: string; time: string }>('/health');
      return res.data;
    },
  });

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <span className="loading loading-spinner loading-sm" />
        <span>Server ကို ချိတ်နေသည်...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="alert alert-error alert-soft">
        <span>Server ကို မချိတ်နိုင်ပါ။ Backend run နေသလား စစ်ပါ။</span>
        <button className="btn btn-sm" onClick={() => refetch()}>
          ထပ်ကြိုးစား
        </button>
      </div>
    );
  }

  return (
    <div role="status" className="alert alert-success alert-soft">
      <span>
        Server: {data.status} ({new Date(data.time).toLocaleTimeString()})
      </span>
      <button
        className="btn btn-sm"
        onClick={() => refetch()}
        disabled={isFetching}
      >
        Refresh
      </button>
    </div>
  );
}

export default function DesignPreview() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md space-y-6 bg-base-100 p-4 md:max-w-2xl lg:max-w-4xl">
      <h1 className="text-2xl font-semibold">Expense Tracker</h1>

      <ServerStatus />

      <section className="card border border-base-300 bg-base-100">
        <div className="card-body gap-1 p-4">
          <p className="text-sm opacity-70">လက်ကျန်ငွေ</p>
          <p className="text-3xl font-semibold tabular-nums">
            1,490,000{' '}
            <span className="text-base font-normal opacity-60">Ks</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="badge badge-success badge-soft">+ 1,500,000</span>
            <span className="badge badge-error badge-soft">- 10,000</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {swatches.map((s) => (
          <div
            key={s.label}
            className={`rounded-box p-4 text-sm font-medium ${s.cls}`}
          >
            {s.label}
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <input
          className="input w-full text-base"
          placeholder="မှတ်ချက် (ဥပမာ - ထမင်းစား)"
        />
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary min-h-11">သိမ်းမည်</button>
          <button className="btn btn-outline min-h-11">ပယ်ဖျက်</button>
          <button className="btn btn-ghost min-h-11">နောက်မှ</button>
        </div>
      </section>
    </main>
  );
}
