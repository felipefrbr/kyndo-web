import { useAuth } from '@/auth/useAuth';
import { LayoutDashboard } from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-gray-600">Bem-vindo, {user?.name}!</p>
      </div>

      <div className="rounded-lg border bg-white p-8 text-center">
        <LayoutDashboard className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-lg font-medium text-gray-900">Metricas da plataforma aparecerão aqui</h2>
        <p className="mt-2 text-gray-500">
          Gerencie campanhas, usuarios e saques.
        </p>
      </div>
    </div>
  );
}
