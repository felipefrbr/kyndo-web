import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Users, Megaphone, FileText, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { getAdminDashboard, type AdminStats } from '@/api/dashboard.api';

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  const cards = [
    { label: 'Usuarios', value: stats?.total_users ?? 0, sub: `${stats?.creators ?? 0} criadores, ${stats?.promoters ?? 0} divulgadores`, icon: Users, color: 'text-blue-600' },
    { label: 'Campanhas', value: stats?.total_campaigns ?? 0, sub: `${stats?.active_campaigns ?? 0} ativas`, icon: Megaphone, color: 'text-green-600' },
    { label: 'Posts', value: stats?.total_posts ?? 0, sub: `${stats?.monitoring_posts ?? 0} monitorando`, icon: FileText, color: 'text-purple-600' },
    { label: 'Saques Processados', value: stats?.processed_withdrawals ?? 0, icon: CreditCard, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
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
            {'sub' in c && c.sub && <p className="mt-1 text-xs text-gray-400">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        {(stats?.pending_campaigns ?? 0) > 0 && (
          <Link to="/admin/campaigns" className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 hover:bg-yellow-100">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">{stats?.pending_campaigns} campanha(s) aguardando aprovacao</span>
          </Link>
        )}
        {(stats?.pending_withdrawals ?? 0) > 0 && (
          <Link to="/admin/withdrawals" className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 hover:bg-orange-100">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">{stats?.pending_withdrawals} saque(s) pendente(s)</span>
          </Link>
        )}
      </div>
    </div>
  );
}
