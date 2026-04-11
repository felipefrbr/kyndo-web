import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import client from '@/api/client';
import { formatDate } from '@/lib/formatters';
import type { PostItem } from '@/api/marketplace.api';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending_review: { label: 'Aguardando', color: 'bg-yellow-100 text-yellow-700' },
  monitoring: { label: 'Monitorando', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-700' },
  completed: { label: 'Concluido', color: 'bg-purple-100 text-purple-700' },
};

export function PostManagement() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    const params: Record<string, any> = { page, per_page: 10 };
    if (statusFilter) params.status = statusFilter;
    client.get('/admin/posts', { params })
      .then(({ data }) => { setPosts(data.posts ?? []); setTotal(data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, statusFilter]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try { await client.post(`/admin/posts/${id}/approve`); load(); } finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    setActionLoading(true);
    try { await client.post(`/admin/posts/${rejectId}/reject`, { reason: rejectReason }); setRejectId(null); setRejectReason(''); load(); } finally { setActionLoading(false); }
  };

  const statuses = [
    { value: '', label: 'Todos' },
    { value: 'pending_review', label: 'Aguardando' },
    { value: 'monitoring', label: 'Monitorando' },
    { value: 'rejected', label: 'Rejeitados' },
  ];

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gestao de Posts</h1>

      <div className="flex gap-2">
        {statuses.map((s) => (
          <button key={s.value} onClick={() => { setStatusFilter(s.value); setPage(1); }}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${statusFilter === s.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center text-gray-500">Nenhum post encontrado.</div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Plataforma</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map((p) => {
                const st = statusConfig[p.status] ?? { label: p.status, color: 'bg-gray-100 text-gray-700' };
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{p.platform}</td>
                    <td className="px-4 py-3">
                      <a href={p.post_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" /> Abrir
                      </a>
                    </td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span></td>
                    <td className="px-4 py-3 font-medium">{p.last_known_views.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3 flex gap-2">
                      {p.status === 'pending_review' && (
                        <>
                          <button onClick={() => handleApprove(p.id)} disabled={actionLoading} className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700">Aprovar</button>
                          <button onClick={() => setRejectId(p.id)} className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700">Rejeitar</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-md border px-3 py-1 text-sm disabled:opacity-50">Anterior</button>
          <span className="text-sm text-gray-600">Pagina {page} de {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-md border px-3 py-1 text-sm disabled:opacity-50">Proxima</button>
        </div>
      )}

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Rejeitar Post</h3>
            <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              className="mt-3 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="Motivo da rejeicao..." />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setRejectId(null); setRejectReason(''); }} className="rounded-md border px-4 py-2 text-sm text-gray-700">Cancelar</button>
              <button onClick={handleReject} disabled={actionLoading || !rejectReason.trim()} className="rounded-md bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
