import { useAuth } from '@/auth/useAuth';
import { Search } from 'lucide-react';
import { Link } from 'react-router';

export function PromoterDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel do Divulgador</h1>
        <p className="text-gray-600">Bem-vindo, {user?.name}!</p>
      </div>

      <div className="rounded-lg border bg-white p-8 text-center">
        <Search className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-lg font-medium text-gray-900">Campanhas disponíveis aparecerão aqui</h2>
        <p className="mt-2 text-gray-500">
          Explore o marketplace para encontrar campanhas e comecar a ganhar.
        </p>
        <Link
          to="/promoter/browse"
          className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Explorar Marketplace
        </Link>
      </div>
    </div>
  );
}
