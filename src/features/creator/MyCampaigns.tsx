import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Plus } from 'lucide-react';
import { listCampaigns } from '@/api/campaigns.api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Campaign } from '@/types/campaign.types';

export function MyCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listCampaigns(page, 10)
      .then((data) => {
        setCampaigns(data.campaigns ?? []);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Campanhas</h1>
          <p className="text-gray-600">{total} campanha{total !== 1 && 's'}</p>
        </div>
        <Link
          to="/creator/campaigns/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Criar Campanha
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <h2 className="text-lg font-medium text-gray-900">Voce ainda nao tem campanhas</h2>
          <p className="mt-2 text-gray-500">Crie sua primeira campanha para divulgar seu conteudo.</p>
          <Link
            to="/creator/campaigns/new"
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Criar Campanha
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {campaigns.map((c) => (
              <Link
                key={c.id}
                to={`/creator/campaigns/${c.id}`}
                className="flex items-center gap-4 rounded-lg border bg-white p-5 transition-shadow hover:shadow-md"
              >
                {c.cover_image_url ? (
                  <img src={c.cover_image_url} alt={c.title} className="h-20 w-20 flex-shrink-0 rounded-md object-cover" />
                ) : (
                  <div className="h-20 w-20 flex-shrink-0 rounded-md bg-gradient-to-br from-gray-100 to-gray-200" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="truncate text-lg font-semibold text-gray-900">{c.title}</h3>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-500">{c.description || 'Sem descricao'}</p>
                  <p className="mt-2 text-xs text-gray-400">Criada em {formatDate(c.created_at)}</p>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-medium text-gray-900">Orcamento: {formatCurrency(c.budget_cents)}</p>
                  <p className="text-sm text-gray-500">CPM: {formatCurrency(c.cpm_cents)}</p>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Pagina {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Proxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
