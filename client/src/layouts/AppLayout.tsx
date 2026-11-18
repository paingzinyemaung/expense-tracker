import {
  ArrowLeftRight,
  LayoutDashboard,
  LogOut,
  Tags,
  Wallet,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../features/auth/useAuth';

const navItems = [
  { to: '/', label: 'ပင်မ', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'မှတ်တမ်း', icon: ArrowLeftRight, end: false },
  { to: '/categories', label: 'အမျိုးအစား', icon: Tags, end: false },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-field bg-primary text-primary-content">
        <Wallet className="size-5" aria-hidden />
      </span>
      <span className="font-semibold">Expense Tracker</span>
    </div>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const initial = user?.name.trim().charAt(0).toUpperCase() ?? '?';

  return (
    <div className="min-h-dvh bg-base-200 lg:grid lg:grid-cols-[16rem_1fr]">
      {/* ===== Desktop: ဘေး sidebar (lg နဲ့အထက်မှာပဲပြ) ===== */}
      <aside className="hidden border-r border-base-300 bg-base-100 p-4 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <Brand />

        <ul className="menu mt-6 w-full gap-1 p-0">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `min-h-11 ${isActive ? 'menu-active' : ''}`
                }
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center gap-3 border-t border-base-300 pt-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs opacity-60">{user?.email}</p>
          </div>
          <button
            className="btn btn-ghost btn-square min-h-11 min-w-11"
            onClick={() => logout()}
            aria-label="ထွက်မည်"
          >
            <LogOut className="size-5" aria-hidden />
          </button>
        </div>
      </aside>

      {/* ===== အကြောင်းအရာ ===== */}
      <div className="flex min-w-0 flex-col">
        {/* ဖုန်း: အပေါ်ဆုံး header (lg မှာဖျောက်) */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-base-300 bg-base-100/90 px-4 py-2 backdrop-blur lg:hidden">
          <Brand />
          <button
            className="btn btn-ghost btn-square min-h-11 min-w-11"
            onClick={() => logout()}
            aria-label="ထွက်မည်"
          >
            <LogOut className="size-5" aria-hidden />
          </button>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-4 pb-28 lg:px-8 lg:pt-8 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* ===== ဖုန်း: အောက်ခြေ dock (lg မှာဖျောက်) ===== */}
      <nav className="dock lg:hidden" aria-label="အဓိက မီနူး">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? 'dock-active text-primary' : ''
            }
          >
            <Icon className="size-5" aria-hidden />
            <span className="dock-label">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
