import { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Wallet, TrendingUp } from 'lucide-react';
import { getWallet, listTransactions, requestWithdrawal, type WalletTransaction } from '@/api/wallet.api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useAuth } from '@/auth/useAuth';

const txTypeLabels: Record<string, string> = {
  view_earning: 'Ganho por views',
  withdrawal: 'Saque',
  withdrawal_reversal: 'Estorno de saque',
  campaign_payment: 'Pagamento de campanha',
  admin_adjustment: 'Ajuste admin',
};

export function WalletPage() {
  const { user } = useAuth();
  const [balanceCents, setBalanceCents] = useState(0);
  const [txs, setTxs] = useState<WalletTransaction[]>([]);
  const [txTotal, setTxTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([getWallet(), listTransactions('', page, 20)])
      .then(([w, t]) => {
        setBalanceCents(w.wallet.balance_cents);
        setTxs(t.transactions ?? []);
        setTxTotal(t.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cents = Math.round(parseFloat(withdrawAmount || '0') * 100);
    if (cents < 1000) { setError('Minimo R$ 10,00'); return; }
    if (cents > balanceCents) { setError('Saldo insuficiente'); return; }
    if (!pixKey.trim()) { setError('Chave PIX obrigatoria'); return; }

    setWithdrawing(true);
    try {
      await requestWithdrawal(cents, pixKey);
      setShowWithdraw(false);
      setWithdrawAmount('');
      setPixKey('');
      load();
    } catch (err) {
      const message = (err instanceof Error) ? err.message : 'Erro ao solicitar saque';
      setError(message);
    } finally {
      setWithdrawing(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(txTotal / 20));

  if (loading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Carteira</h1>
        <p className="mt-1 text-sm text-gray-500">Gerencie seus ganhos e saques</p>
      </div>

      {/* Balance card */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">Saldo disponivel</p>
            <p className="mt-1 text-4xl font-bold">{formatCurrency(balanceCents)}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
        </div>
        {user?.role === 'promoter' && (
          <button onClick={() => setShowWithdraw(true)}
            className="mt-5 flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30">
            <Wallet className="h-4 w-4" /> Solicitar Saque
          </button>
        )}
      </div>

      {/* Transactions */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="px-6 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Extrato</h2>
        </div>
        {txs.length === 0 ? (
          <div className="px-6 pb-8 pt-4 text-center text-sm text-gray-500">Nenhuma transacao ainda.</div>
        ) : (
          <div>
            {txs.map((t, i) => (
              <div key={t.id} className={`flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${t.amount_cents >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {t.amount_cents >= 0 ? (
                      <ArrowDownCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowUpCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{txTypeLabels[t.tx_type] || t.tx_type}</p>
                    <p className="mt-0.5 max-w-[300px] truncate text-xs text-gray-400">{t.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${t.amount_cents >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {t.amount_cents >= 0 ? '+' : ''}{formatCurrency(t.amount_cents)}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">{formatDate(t.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
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

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60" />
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900">Solicitar Saque</h3>
              <p className="mt-1 text-sm text-gray-500">Saldo disponivel: <strong>{formatCurrency(balanceCents)}</strong></p>

              <form onSubmit={handleWithdraw} className="mt-5 space-y-4">
                {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Valor (R$)</label>
                  <div className="relative mt-2">
                    <span className="absolute left-4 top-2.5 text-gray-400">R$</span>
                    <input type="number" min="10" step="0.01" required value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="10.00" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Chave PIX</label>
                  <input type="text" required value={pixKey} onChange={(e) => setPixKey(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="CPF, email, telefone ou chave aleatoria" />
                </div>

                {withdrawAmount && parseFloat(withdrawAmount) >= 10 && (
                  <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                    Voce recebera <strong>{formatCurrency(Math.round(parseFloat(withdrawAmount) * 100))}</strong> na chave PIX: <strong>{pixKey || '...'}</strong>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowWithdraw(false); setError(''); }}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-shadow hover:shadow-sm">
                    Cancelar
                  </button>
                  <button type="submit" disabled={withdrawing}
                    className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md disabled:opacity-50">
                    {withdrawing ? 'Solicitando...' : 'Confirmar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
