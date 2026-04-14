import { useEffect, useState, useCallback } from 'react';
import { ExternalLink, Trash2, Radio, Eye, DollarSign } from 'lucide-react';
import { listPosts, deletePost, type PostItem } from '@/api/marketplace.api';
import { formatDate } from '@/lib/formatters';
import { PlatformIcon } from '@/components/shared/PlatformIcon';
import type { PlatformKey } from '@/types/campaign.types';

const statusConfig: Record<string, { label: string; bg: string; dot: string }> = {
  pending_review: { label: 'Aguardando', bg: 'bg-yellow-50', dot: 'bg-yellow-400' },
  monitoring: { label: 'Monitorando', bg: 'bg-green-50', dot: 'bg-green-400' },
  approved: { label: 'Aprovado', bg: 'bg-blue-50', dot: 'bg-blue-400' },
  rejected: { label: 'Rejeitado', bg: 'bg-red-50', dot: 'bg-red-400' },
  completed: { label: 'Concluido', bg: 'bg-purple-50', dot: 'bg-purple-400' },
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meus Posts</h1>
        <p className="mt-1 text-sm text-gray-500">{total} post{total !== 1 && 's'} submetido{total !== 1 && 's'}</p>
      </div>

      {loading && posts.length === 0 ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">Nenhum post submetido ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => {
            const st = statusConfig[p.status] ?? { label: p.status, bg: 'bg-gray-50', dot: 'bg-gray-400' };
            const nextPaymentViews = ((Math.floor(p.last_known_views / 1000) + 1) * 1000);
            const viewsToNext = nextPaymentViews - p.last_known_views;
            const progressPercent = p.last_known_views > 0 ? Math.round(((p.last_known_views % 1000) / 1000) * 100) : 0;

            return (
              <div key={p.id} className="overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <PlatformIcon platform={p.platform as PlatformKey} size={20} />
                    </div>
                    <div>
                      <a href={p.post_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-primary">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="max-w-[280px] truncate">{p.post_url}</span>
                      </a>
                      <p className="text-xs text-gray-400">{formatDate(p.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.status === 'monitoring' && <Radio className="h-4 w-4 animate-pulse text-green-500" />}
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${st.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                    {p.status === 'pending_review' && (
                      <button onClick={() => handleDelete(p.id)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl mx-5 bg-gray-100">
                  <div className="flex items-center gap-3 bg-white p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                      <Eye className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">Views</p>
                      <p className="text-lg font-bold text-gray-900">{p.last_known_views.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">Views Pagas</p>
                      <p className="text-lg font-bold text-gray-900">{p.paid_views.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {p.status === 'monitoring' && (
                  <div className="mx-5 mt-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Proximo pagamento em <strong>{viewsToNext.toLocaleString('pt-BR')}</strong> views</span>
                      <span className="font-medium text-primary">{p.last_known_views.toLocaleString('pt-BR')} / {nextPaymentViews.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                )}

                {/* Footer messages */}
                <div className="px-5 pb-5">
                  {p.status === 'completed' && (
                    <div className="mt-4 rounded-xl bg-purple-50 p-3 text-xs text-purple-700">
                      Campanha encerrada. Total de views pagas: <strong>{p.paid_views.toLocaleString('pt-BR')}</strong>
                    </div>
                  )}
                  {p.rejection_reason && (
                    <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                      Motivo da rejeicao: {p.rejection_reason}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
    </div>
  );
}
