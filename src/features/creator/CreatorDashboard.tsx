import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Megaphone, Eye, DollarSign, BarChart3 } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { getCreatorDashboard, type CreatorStats } from '@/api/dashboard.api';
import { formatCurrency } from '@/lib/formatters';

export function CreatorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCreatorDashboard().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  const cards = [
    { label: 'Campanhas Ativas', value: stats?.active_campaigns ?? 0, icon: Megaphone, bg: 'bg-green-100', color: 'text-green-600' },
    { label: 'Total de Campanhas', value: stats?.total_campaigns ?? 0, icon: BarChart3, bg: 'bg-blue-100', color: 'text-blue-600' },
    { label: 'Total de Views', value: (stats?.total_views ?? 0).toLocaleString('pt-BR'), icon: Eye, bg: 'bg-purple-100', color: 'text-purple-600' },
    { label: 'Total Investido', value: formatCurrency(stats?.total_invested ?? 0), icon: DollarSign, bg: 'bg-orange-100', color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel do Criador</h1>
        <p className="mt-1 text-gray-500">Bem-vindo, {user?.name}!</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
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

      <div className="flex gap-3">
        <Link to="/creator/campaigns" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md hover:bg-primary/90">
          Ver Campanhas
        </Link>
        <Link to="/creator/campaigns/new" className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-shadow hover:shadow-md">
          Criar Campanha
        </Link>
      </div>
    </div>
  );
}
