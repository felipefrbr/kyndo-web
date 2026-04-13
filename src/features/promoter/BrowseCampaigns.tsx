import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { listMarketplaceCampaigns, subscribeToCampaign, type MarketplaceCampaign } from '@/api/marketplace.api';
import { formatCurrency } from '@/lib/formatters';

export function BrowseCampaigns() {
  const [campaigns, setCampaigns] = useState<MarketplaceCampaign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    listMarketplaceCampaigns(search, page, 10)
      .then((data) => { setCampaigns(data.campaigns ?? []); setTotal(data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, search]);

  const handleSubscribe = async (id: string) => {
    setSubscribing(id);
    try {
      await subscribeToCampaign(id);
      load();
    } catch {
      alert('Erro ao se inscrever.');
    } finally {
      setSubscribing(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>

      <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar campanhas..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">Buscar</button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center text-gray-500">
          Nenhuma campanha disponivel no momento.
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {campaigns.map((c) => (
              <div key={c.id} className="overflow-hidden rounded-lg border bg-white">
                {c.cover_image_url ? (
                  <img src={c.cover_image_url} alt={c.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 w-full bg-gradient-to-br from-gray-100 to-gray-200" />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900">{c.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">por {c.creator_name}</p>
                    </div>
                    {c.is_subscribed && (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Inscrito</span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">{c.description || 'Sem descricao'}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-primary">{formatCurrency(c.cpm_cents)}</span>
                      <span className="text-sm text-gray-500"> / 1.000 views</span>
                    </div>
                    <span className="text-xs text-gray-400">Orcamento: {formatCurrency(c.budget_cents)}</span>
                  </div>
                  <div className="mt-4">
                    {c.is_subscribed ? (
                      <Link to={`/promoter/campaigns/${c.id}`} className="block w-full rounded-md border border-primary px-4 py-2 text-center text-sm font-medium text-primary hover:bg-primary/5">
                        Ver Conteudo
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(c.id)}
                        disabled={subscribing === c.id}
                        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                      >
                        {subscribing === c.id ? 'Inscrevendo...' : 'Inscrever-se'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-md border px-3 py-1 text-sm disabled:opacity-50">Anterior</button>
              <span className="text-sm text-gray-600">Pagina {page} de {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-md border px-3 py-1 text-sm disabled:opacity-50">Proxima</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
