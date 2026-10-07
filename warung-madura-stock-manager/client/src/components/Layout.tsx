import { NavLink, Outlet } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/produk', label: 'Produk' },
  { to: '/penjualan/baru', label: 'Penjualan Baru' },
  { to: '/riwayat-penjualan', label: 'Riwayat Penjualan' },
  { to: '/riwayat-stok', label: 'Riwayat Stok' },
];

function navLinkClass({ isActive }: { isActive: boolean }): string {
  const base = 'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium';
  return isActive
    ? `${base} bg-green-50 text-green-700`
    : `${base} text-slate-600 hover:bg-slate-100 hover:text-slate-900`;
}

export function Layout() {
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-slate-200 bg-white md:min-h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="px-4 py-4 md:py-6">
          <p className="text-base font-semibold text-slate-900">Warung Madura</p>
          <p className="text-xs text-slate-500">Stock Manager</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
