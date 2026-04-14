import { useEffect, useState } from 'react';
import { ExternalLink, Edit3 } from 'lucide-react';
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
  const [editViewsId, setEditViewsId] = useState<string | null>(null);
  const [editViewsValue, setEditViewsValue] = useState('');

  const load = () => {
    setLoading(true);
    const params: Record<string, string | number> = { page, per_page: 10 };
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

  const handleUpdateViews = async () => {
    if (!editViewsId) return;
    const count = parseInt(editViewsValue);
    if (isNaN(count) || count <= 0) return;
    setActionLoading(true);
    try { await client.put(`/admin/posts/${editViewsId}/views`, { view_count: count }); setEditViewsId(null); setEditViewsValue(''); load(); } finally { setActionLoading(false); }
  };

  const statuses = [
    { value: '', label: 'Todos' },
    { value: 'pending_review', label: 'Aguardando' },
    { value: 'monitoring', label: 'Monitorando' },
    { value: 'rejected', label: 'Rejeitados' },
    { value: 'completed', label: 'Concluidos' },
  ];

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestao de Posts</h1>
        <p className="mt-1 text-sm text-gray-500">Revisao e monitoramento de posts</p>
      </div>

      <div className="flex gap-2">
        {statuses.map((s) => (
          <button key={s.value} onClick={() => { setStatusFilter(s.value); setPage(1); }}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${statusFilter === s.value ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center text-gray-500 shadow-sm">Nenhum post encontrado.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-4 py-3">Plataforma</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Pagas</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map((p) => {
                const st = statusConfig[p.status] ?? { label: p.status, color: 'bg-gray-100 text-gray-700' };
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">{p.platform}</td>
                    <td className="px-4 py-3">
                      <a href={p.post_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" /> Abrir
                      </a>
                    </td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span></td>
                    <td className="px-4 py-3 font-medium">{p.last_known_views.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-gray-500">{p.paid_views.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {p.status === 'pending_review' && (
                          <>
                            <button onClick={() => handleApprove(p.id)} disabled={actionLoading} className="rounded-lg bg-green-600 px-2 py-1 text-xs text-white shadow-sm hover:shadow-md transition-shadow hover:bg-green-700">Aprovar</button>
                            <button onClick={() => setRejectId(p.id)} className="rounded-lg bg-red-600 px-2 py-1 text-xs text-white shadow-sm hover:shadow-md transition-shadow hover:bg-red-700">Rejeitar</button>
                          </>
                        )}
                        {(p.status === 'monitoring' || p.status === 'completed') && (
                          <button onClick={() => { setEditViewsId(p.id); setEditViewsValue(String(p.last_known_views)); }}
                            className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 shadow-sm hover:shadow-md transition-shadow hover:bg-gray-100">
                            <Edit3 className="h-3 w-3" /> Views
                          </button>
                        )}
                      </div>
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
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm hover:shadow-md transition-shadow disabled:opacity-50">Anterior</button>
          <span className="text-sm text-gray-600">Pagina {page} de {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm hover:shadow-md transition-shadow disabled:opacity-50">Proxima</button>
        </div>
      )}

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 rounded-t-2xl" />
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900">Rejeitar Post</h3>
              <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-gray-400">Motivo da rejeicao</label>
              <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Motivo da rejeicao..." />
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => { setRejectId(null); setRejectReason(''); }} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md transition-shadow">Cancelar</button>
                <button onClick={handleReject} disabled={actionLoading || !rejectReason.trim()} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition-shadow disabled:opacity-50">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update views modal */}
      {editViewsId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 rounded-t-2xl" />
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900">Atualizar Views</h3>
              <p className="mt-1 text-sm text-gray-500">O valor informado sera a nova contagem total de views.</p>
              <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-gray-400">Numero de views</label>
              <input type="number" min="0" value={editViewsValue} onChange={(e) => setEditViewsValue(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Numero de views" />
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => { setEditViewsId(null); setEditViewsValue(''); }} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md transition-shadow">Cancelar</button>
                <button onClick={handleUpdateViews} disabled={actionLoading} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition-shadow disabled:opacity-50">Atualizar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
