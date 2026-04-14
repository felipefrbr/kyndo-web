import { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import { adminListWithdrawals, adminApproveWithdrawal, adminCompleteWithdrawal, adminRejectWithdrawal, type Withdrawal } from '@/api/wallet.api';
import { formatCurrency, formatDate } from '@/lib/formatters';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Processando', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Concluido', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-700' },
};

export function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    adminListWithdrawals(statusFilter, page, 10)
      .then((data) => { setWithdrawals(data.withdrawals ?? []); setTotal(data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, statusFilter]);

  const handleApprove = async (id: string) => { setActionLoading(true); try { await adminApproveWithdrawal(id); load(); } finally { setActionLoading(false); } };
  const handleComplete = async (id: string) => { setActionLoading(true); try { await adminCompleteWithdrawal(id); load(); } finally { setActionLoading(false); } };
  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    setActionLoading(true);
    try { await adminRejectWithdrawal(rejectId, rejectReason); setRejectId(null); setRejectReason(''); load(); } finally { setActionLoading(false); }
  };

  const copyPix = (pix: string) => { navigator.clipboard.writeText(pix); };

  const statuses = [
    { value: '', label: 'Todos' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'processing', label: 'Processando' },
    { value: 'completed', label: 'Concluidos' },
    { value: 'rejected', label: 'Rejeitados' },
  ];

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestao de Saques</h1>
        <p className="mt-1 text-sm text-gray-500">Aprovacao e processamento de saques</p>
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
      ) : withdrawals.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center text-gray-500 shadow-sm">Nenhum saque encontrado.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">PIX</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {withdrawals.map((w) => {
                const st = statusConfig[w.status] ?? { label: w.status, color: 'bg-gray-100 text-gray-700' };
                return (
                  <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{formatCurrency(w.amount_cents)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => copyPix(w.pix_key)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-gray-700 hover:bg-gray-100 transition-colors" title="Copiar PIX">
                        {w.pix_key} <Copy className="h-3 w-3" />
                      </button>
                    </td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span></td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(w.created_at)}</td>
                    <td className="px-4 py-3 flex gap-2">
                      {w.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(w.id)} disabled={actionLoading} className="rounded-lg bg-green-600 px-2 py-1 text-xs text-white shadow-sm hover:shadow-md transition-shadow hover:bg-green-700">Aprovar</button>
                          <button onClick={() => setRejectId(w.id)} className="rounded-lg bg-red-600 px-2 py-1 text-xs text-white shadow-sm hover:shadow-md transition-shadow hover:bg-red-700">Rejeitar</button>
                        </>
                      )}
                      {w.status === 'processing' && (
                        <button onClick={() => handleComplete(w.id)} disabled={actionLoading} className="rounded-lg bg-blue-600 px-2 py-1 text-xs text-white shadow-sm hover:shadow-md transition-shadow hover:bg-blue-700">Concluir</button>
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
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm hover:shadow-md transition-shadow disabled:opacity-50">Anterior</button>
          <span className="text-sm text-gray-600">Pagina {page} de {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm hover:shadow-md transition-shadow disabled:opacity-50">Proxima</button>
        </div>
      )}

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 rounded-t-2xl" />
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900">Rejeitar Saque</h3>
              <p className="mt-1 text-sm text-gray-500">O valor sera estornado para a carteira do usuario.</p>
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
    </div>
  );
}
