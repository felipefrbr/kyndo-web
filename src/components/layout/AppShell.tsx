import { Link, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/auth/useAuth';
import { LogOut, LayoutDashboard, Megaphone, Search, Wallet, FileText, Users, CreditCard } from 'lucide-react';

const creatorLinks = [
  { to: '/creator', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/creator/campaigns', label: 'Minhas Campanhas', icon: Megaphone },
];

const promoterLinks = [
  { to: '/promoter', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/promoter/browse', label: 'Marketplace', icon: Search },
  { to: '/promoter/posts', label: 'Meus Posts', icon: FileText },
  { to: '/promoter/wallet', label: 'Carteira', icon: Wallet },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/campaigns', label: 'Campanhas', icon: Megaphone },
  { to: '/admin/users', label: 'Usuarios', icon: Users },
  { to: '/admin/withdrawals', label: 'Saques', icon: CreditCard },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = user?.role === 'creator' ? creatorLinks
    : user?.role === 'promoter' ? promoterLinks
    : adminLinks;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r bg-white md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <Link to="/" className="text-xl font-bold text-primary">Kyndo</Link>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {links.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to ||
                (to !== '/' && to.length > 1 && location.pathname.startsWith(to) && location.pathname !== links[0].to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4">
            <div className="mb-3 px-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
          <Link to="/" className="text-xl font-bold text-primary">Kyndo</Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="rounded-md p-2 text-gray-600 hover:bg-gray-100">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex border-b bg-white px-2 md:hidden">
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
