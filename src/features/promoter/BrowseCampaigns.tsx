import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Search, Clock } from 'lucide-react';
import { listMarketplaceCampaigns, subscribeToCampaign, type MarketplaceCampaign } from '@/api/marketplace.api';
import { formatCurrency, formatDateTime } from '@/lib/formatters';

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
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {campaigns.map((c) => (
              <div key={c.id} className="group flex flex-col overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md">
                <div className="relative aspect-square overflow-hidden">
                  {c.cover_image_url ? (
                    <img src={c.cover_image_url} alt={c.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200" />
                  )}
                  {c.is_subscribed && (
                    <span className="absolute top-2 right-2 rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white shadow">Inscrito</span>
                  )}
                  {c.status === 'scheduled' && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-medium text-white shadow">
                      <Clock className="h-3 w-3" /> Agendada
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{c.title}</h3>
                  <p className="mt-0.5 truncate text-xs text-gray-500">por {c.creator_name}</p>
                  {c.status === 'scheduled' && c.start_at && (
                    <p className="mt-1 text-[11px] text-indigo-600">Inicia em {formatDateTime(c.start_at)}</p>
                  )}
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-[10px] text-gray-500">a partir de</span>
                    <span className="text-base font-bold text-primary">{formatCurrency(c.cpm_cents)}</span>
                    <span className="text-xs text-gray-500">/ 1k</span>
                  </div>
                  {c.platforms && c.platforms.length > 0 && (
                    <div className="mt-1 flex gap-1 text-base">
                      {c.platforms.map((p) => (
                        <span key={p.platform} title={p.platform}>
                          {p.platform === 'tiktok' ? '🎵' : p.platform === 'youtube' ? '▶️' : '📷'}
                        </span>
                      ))}
                    </div>
                  )}
                  {(() => {
                    const percent = c.budget_cents > 0
                      ? Math.min(100, Math.round((c.spent_cents / c.budget_cents) * 100))
                      : 0;
                    return (
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-gray-500">
                          <span>Progresso</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })()}
                  <div className="mt-3 flex-1" />
                  {c.is_subscribed ? (
                    <Link to={`/promoter/campaigns/${c.id}`} className="block w-full rounded-md border border-primary px-3 py-1.5 text-center text-xs font-medium text-primary hover:bg-primary/5">
                      Ver Conteudo
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(c.id)}
                      disabled={subscribing === c.id}
                      className="w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                      {subscribing === c.id ? 'Inscrevendo...' : 'Inscrever-se'}
                    </button>
                  )}
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
