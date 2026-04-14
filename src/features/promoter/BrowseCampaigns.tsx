import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Search, Clock } from 'lucide-react';
import { listMarketplaceCampaigns, type MarketplaceCampaign } from '@/api/marketplace.api';
import { formatCurrency, formatCountdown } from '@/lib/formatters';
import { PlatformIcon } from '@/components/shared/PlatformIcon';

export function BrowseCampaigns() {
  const [campaigns, setCampaigns] = useState<MarketplaceCampaign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const load = () => {
    setLoading(true);
    listMarketplaceCampaigns(search, page, 10)
      .then((data) => { setCampaigns(data.campaigns ?? []); setTotal(data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, search]);

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        <p className="mt-1 text-sm text-gray-500">Encontre campanhas e ganhe por views</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar campanhas..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md hover:bg-primary/90">
          Buscar
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">Nenhuma campanha disponivel no momento.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {campaigns.map((c) => {
              const percent = c.budget_cents > 0 ? Math.min(100, Math.round((c.spent_cents / c.budget_cents) * 100)) : 0;
              return (
                <Link
                  key={c.id}
                  to={`/promoter/campaigns/${c.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden">
                    {c.cover_image_url ? (
                      <img src={c.cover_image_url} alt={c.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                    {/* Badges */}
                    {c.is_subscribed && (
                      <span className="absolute top-2 right-2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-medium text-white shadow">Inscrito</span>
                    )}
                    {c.status === 'scheduled' && c.start_at && (
                      <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-medium text-white shadow">
                        <Clock className="h-3 w-3" /> {formatCountdown(c.start_at)}
                      </span>
                    )}
                    {/* Bottom gradient with platforms */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-3 pb-2 pt-6">
                      <div className="flex items-center gap-1.5">
                        {(c.platforms ?? []).map((p) => (
                          <PlatformIcon key={p.platform} platform={p.platform} size={14} colored={false} className="text-white" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-3">
                    <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{c.title}</h3>
                    <p className="mt-0.5 truncate text-xs text-gray-400">por {c.creator_name}</p>

                    {c.status === 'scheduled' && c.start_at && (
                      <p className="mt-1 text-[11px] font-medium text-indigo-600">Comeca em {formatCountdown(c.start_at)}</p>
                    )}

                    <div className="mt-2">
                      <span className="text-lg font-bold text-primary">{formatCurrency(c.cpm_cents)}</span>
                      <span className="ml-1 text-[10px] text-gray-400">/ 1k views</span>
                    </div>

                    {/* Progress */}
                    <div className="mt-2">
                      <div className="h-1 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${percent}%` }} />
                      </div>
                      <p className="mt-0.5 text-right text-[9px] text-gray-400">{percent}% do orcamento</p>
                    </div>

                    <div className="mt-auto pt-3">
                      <span className={`block w-full rounded-xl py-2 text-center text-xs font-medium transition-colors ${
                        c.is_subscribed
                          ? 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                          : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                      }`}>
                        Ver Campanha
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-xl border border-gray-200 bg-white px-4 py-1.5 text-sm shadow-sm transition-shadow hover:shadow-md disabled:opacity-50">
                Anterior
              </button>
              <span className="text-sm text-gray-500">Pagina {page} de {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="rounded-xl border border-gray-200 bg-white px-4 py-1.5 text-sm shadow-sm transition-shadow hover:shadow-md disabled:opacity-50">
                Proxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
