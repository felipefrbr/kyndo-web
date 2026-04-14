import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Eye, DollarSign, FileText, Wallet } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { getPromoterDashboard, type PromoterStats } from '@/api/dashboard.api';
import { formatCurrency } from '@/lib/formatters';

export function PromoterDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PromoterStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPromoterDashboard().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  const cards = [
    { label: 'Saldo', value: formatCurrency(stats?.balance_cents ?? 0), icon: Wallet, bg: 'bg-green-100', color: 'text-green-600' },
    { label: 'Total Ganho', value: formatCurrency(stats?.total_earned ?? 0), icon: DollarSign, bg: 'bg-orange-100', color: 'text-orange-600' },
    { label: 'Total Views', value: (stats?.total_views ?? 0).toLocaleString('pt-BR'), icon: Eye, bg: 'bg-purple-100', color: 'text-purple-600' },
    { label: 'Posts', value: stats?.total_posts ?? 0, icon: FileText, bg: 'bg-blue-100', color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel do Divulgador</h1>
        <p className="mt-1 text-gray-500">Bem-vindo, {user?.name}!</p>
      </div>

      {/* Prominent balance card */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-100">Seu Saldo</p>
            <p className="text-3xl font-bold">{formatCurrency(stats?.balance_cents ?? 0)}</p>
          </div>
        </div>
        <Link to="/promoter/wallet" className="mt-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/30">
          Ver extrato
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.slice(1).map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{c.label}</p>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${c.bg}`}>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/promoter/browse" className="group rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Campanhas Inscritas</p>
          <p className="mt-2 text-xl font-bold text-gray-900">{stats?.active_subscriptions ?? 0}</p>
          <span className="mt-3 inline-block text-sm font-medium text-primary group-hover:underline">Explorar marketplace</span>
        </Link>
        <Link to="/promoter/wallet" className="group rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Carteira</p>
          <p className="mt-2 text-xl font-bold text-gray-900">{formatCurrency(stats?.balance_cents ?? 0)}</p>
          <span className="mt-3 inline-block text-sm font-medium text-primary group-hover:underline">Ver extrato</span>
        </Link>
      </div>
    </div>
  );
}
