import { useEffect, useState, useCallback } from 'react';
import { ExternalLink, Trash2, Radio } from 'lucide-react';
import { listPosts, deletePost, type PostItem } from '@/api/marketplace.api';
import { formatDate, formatCurrency } from '@/lib/formatters';

const platformIcons: Record<string, string> = { tiktok: '🎵', youtube: '▶️', instagram: '📷' };
const statusConfig: Record<string, { label: string; color: string }> = {
  pending_review: { label: 'Aguardando', color: 'bg-yellow-100 text-yellow-700' },
  monitoring: { label: 'Monitorando', color: 'bg-green-100 text-green-700' },
  approved: { label: 'Aprovado', color: 'bg-blue-100 text-blue-700' },
  rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-700' },
  completed: { label: 'Concluido', color: 'bg-purple-100 text-purple-700' },
};

export function MyPosts() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    listPosts(undefined, page, 10)
      .then((data) => { setPosts(data.posts ?? []); setTotal(data.total); })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(load, [load]);

  // Auto-refresh every 15s if any post is monitoring
  useEffect(() => {
    const hasMonitoring = posts.some((p) => p.status === 'monitoring');
    if (!hasMonitoring) return;
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [posts, load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    await deletePost(id);
    load();
  };

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meus Posts</h1>
        <p className="text-gray-600">{total} post{total !== 1 && 's'} submetido{total !== 1 && 's'}</p>
      </div>

      {loading && posts.length === 0 ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center text-gray-500">Nenhum post submetido ainda.</div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => {
            const st = statusConfig[p.status] ?? { label: p.status, color: 'bg-gray-100 text-gray-700' };
            const nextPaymentViews = ((Math.floor(p.last_known_views / 1000) + 1) * 1000);
            const viewsToNext = nextPaymentViews - p.last_known_views;
            const progressPercent = p.last_known_views > 0 ? Math.round(((p.last_known_views % 1000) / 1000) * 100) : 0;

            return (
              <div key={p.id} className="rounded-lg border bg-white p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{platformIcons[p.platform] ?? '🔗'}</span>
                    <div>
                      <a href={p.post_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" /> {p.post_url.length > 50 ? p.post_url.slice(0, 50) + '...' : p.post_url}
                      </a>
                      <p className="text-xs text-gray-400">{formatDate(p.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.status === 'monitoring' && <Radio className="h-4 w-4 animate-pulse text-green-500" />}
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span>
                    {p.status === 'pending_review' && (
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Views</p>
                    <p className="text-lg font-bold text-gray-900">{p.last_known_views.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Views Pagas</p>
                    <p className="text-lg font-bold text-gray-900">{p.paid_views.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-lg font-bold text-gray-900">{st.label}</p>
                  </div>
                </div>

                {p.status === 'monitoring' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Proximo pagamento em {viewsToNext.toLocaleString('pt-BR')} views</span>
                      <span>{p.last_known_views.toLocaleString('pt-BR')} / {nextPaymentViews.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                )}

                {p.status === 'completed' && (
                  <div className="mt-3 rounded-md bg-purple-50 p-2 text-xs text-purple-700">
                    Campanha encerrada. Total de views pagas: {p.paid_views.toLocaleString('pt-BR')}
                  </div>
                )}

                {p.rejection_reason && (
                  <div className="mt-3 rounded-md bg-red-50 p-2 text-xs text-red-700">
                    Motivo da rejeicao: {p.rejection_reason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-md border px-3 py-1 text-sm disabled:opacity-50">Anterior</button>
          <span className="text-sm text-gray-600">Pagina {page} de {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-md border px-3 py-1 text-sm disabled:opacity-50">Proxima</button>
        </div>
      )}
    </div>
  );
}
