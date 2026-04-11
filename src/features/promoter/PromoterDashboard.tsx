import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Eye, DollarSign, FileText, Megaphone, Wallet } from 'lucide-react';
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
    { label: 'Saldo', value: formatCurrency(stats?.balance_cents ?? 0), icon: Wallet, color: 'text-green-600' },
    { label: 'Total Ganho', value: formatCurrency(stats?.total_earned ?? 0), icon: DollarSign, color: 'text-orange-600' },
    { label: 'Total Views', value: (stats?.total_views ?? 0).toLocaleString('pt-BR'), icon: Eye, color: 'text-purple-600' },
    { label: 'Posts', value: stats?.total_posts ?? 0, icon: FileText, color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel do Divulgador</h1>
        <p className="text-gray-600">Bem-vindo, {user?.name}!</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{c.label}</p>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-gray-500">Campanhas Inscritas</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{stats?.active_subscriptions ?? 0}</p>
          <Link to="/promoter/browse" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">Explorar marketplace</Link>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-gray-500">Carteira</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(stats?.balance_cents ?? 0)}</p>
          <Link to="/promoter/wallet" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">Ver extrato</Link>
        </div>
      </div>
    </div>
  );
}
