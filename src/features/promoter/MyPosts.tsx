import { useEffect, useState } from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
import { listPosts, deletePost, type PostItem } from '@/api/marketplace.api';
import { formatDate } from '@/lib/formatters';

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

  const load = () => {
    setLoading(true);
    listPosts(undefined, page, 10)
      .then((data) => { setPosts(data.posts ?? []); setTotal(data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

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

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center text-gray-500">Nenhum post submetido ainda.</div>
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
                    <td className="px-4 py-3">{platformIcons[p.platform] ?? '🔗'} {p.platform}</td>
                    <td className="px-4 py-3">
                      <a href={p.post_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" /> Link
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 font-medium">{p.last_known_views.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      {p.status === 'pending_review' && (
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
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
    </div>
  );
}
