import { useEffect, useState } from 'react';
import { adminListCampaigns, adminApproveCampaign, adminRejectCampaign } from '@/api/admin.api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Campaign } from '@/types/campaign.types';

export function CampaignApproval() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    adminListCampaigns(statusFilter, page, 10)
      .then((data) => {
        setCampaigns(data.campaigns ?? []);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, statusFilter]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await adminApproveCampaign(id);
      load();
      setSelected(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await adminRejectCampaign(id, rejectReason);
      load();
      setSelected(null);
      setShowReject(false);
      setRejectReason('');
    } finally {
      setActionLoading(false);
    }
  };

  const statuses: { value: string; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'pending_approval', label: 'Aguardando' },
    { value: 'approved', label: 'Aprovadas' },
    { value: 'active', label: 'Ativas' },
    { value: 'rejected', label: 'Rejeitadas' },
    { value: 'draft', label: 'Rascunho' },
    { value: 'exhausted', label: 'Encerradas' },
  ];

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestao de Campanhas</h1>
        <p className="mt-1 text-sm text-gray-500">Aprovacao e gerenciamento de campanhas</p>
      </div>

      <div className="flex gap-2">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => { setStatusFilter(s.value); setPage(1); }}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
              statusFilter === s.value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center text-gray-500 shadow-sm">
          Nenhuma campanha encontrada.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-4 py-3">Titulo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Orcamento</th>
                <th className="px-4 py-3">CPM</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      {c.cover_image_url ? (
                        <img src={c.cover_image_url} alt="" className="h-10 w-10 flex-shrink-0 rounded-xl object-cover" />
                      ) : (
                        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200" />
                      )}
                      <span>{c.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">{formatCurrency(c.budget_cents)}</td>
                  <td className="px-4 py-3">{formatCurrency(c.cpm_cents)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(c)}
                      className="rounded-xl px-3 py-1 text-sm font-medium text-primary shadow-sm hover:shadow-md transition-shadow"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
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

      {/* Campaign Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 rounded-t-2xl" />
            <div className="p-6">
              {selected.cover_image_url && (
                <img src={selected.cover_image_url} alt={selected.title} className="mb-4 w-full rounded-xl object-cover max-h-60" />
              )}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">{selected.title}</h3>
                <StatusBadge status={selected.status} />
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <p><strong>Descricao:</strong> {selected.description || '—'}</p>
                <p><strong>URL:</strong> {selected.content_url ? <a href={selected.content_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{selected.content_url}</a> : '—'}</p>
                <p><strong>Instrucoes:</strong> {selected.content_instructions || '—'}</p>
                <p><strong>Orcamento:</strong> {formatCurrency(selected.budget_cents)}</p>
                <p><strong>CPM:</strong> {formatCurrency(selected.cpm_cents)}</p>
                <p><strong>Pagamentos possiveis:</strong> {selected.cpm_cents > 0 ? Math.floor(selected.budget_cents / selected.cpm_cents) : 0}</p>
                {selected.rejection_reason && (
                  <p className="text-red-600"><strong>Motivo rejeicao:</strong> {selected.rejection_reason}</p>
                )}
              </div>

              {showReject && (
                <div className="mt-4">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">Motivo da rejeicao *</label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Descreva o motivo..."
                  />
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => { setSelected(null); setShowReject(false); setRejectReason(''); }} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  Fechar
                </button>
                {selected.status === 'pending_approval' && !showReject && (
                  <>
                    <button onClick={() => setShowReject(true)} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:shadow-md transition-shadow">
                      Rejeitar
                    </button>
                    <button onClick={() => handleApprove(selected.id)} disabled={actionLoading} className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition-shadow disabled:opacity-50">
                      {actionLoading ? 'Aprovando...' : 'Aprovar'}
                    </button>
                  </>
                )}
                {showReject && (
                  <button onClick={() => handleReject(selected.id)} disabled={actionLoading || !rejectReason.trim()} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition-shadow disabled:opacity-50">
                    {actionLoading ? 'Rejeitando...' : 'Confirmar Rejeicao'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
