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
    { label: 'Campanhas Ativas', value: stats?.active_campaigns ?? 0, icon: Megaphone, color: 'text-green-600' },
    { label: 'Total de Campanhas', value: stats?.total_campaigns ?? 0, icon: BarChart3, color: 'text-blue-600' },
    { label: 'Total de Views', value: (stats?.total_views ?? 0).toLocaleString('pt-BR'), icon: Eye, color: 'text-purple-600' },
    { label: 'Total Investido', value: formatCurrency(stats?.total_invested ?? 0), icon: DollarSign, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel do Criador</h1>
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

      <div className="flex gap-3">
        <Link to="/creator/campaigns" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
          Ver Campanhas
        </Link>
        <Link to="/creator/campaigns/new" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Criar Campanha
        </Link>
      </div>
    </div>
  );
}
