import { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react';
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Carteira</h1>

      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Saldo disponivel</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(balanceCents)}</p>
          </div>
          {user?.role === 'promoter' && (
            <button onClick={() => setShowWithdraw(true)} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
              <Wallet className="h-4 w-4" /> Solicitar Saque
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-5 py-3">
          <h2 className="font-medium text-gray-900">Extrato</h2>
        </div>
        {txs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhuma transacao ainda.</div>
        ) : (
          <div className="divide-y">
            {txs.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  {t.amount_cents >= 0 ? (
                    <ArrowDownCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowUpCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{txTypeLabels[t.tx_type] || t.tx_type}</p>
                    <p className="text-xs text-gray-500">{t.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${t.amount_cents >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {t.amount_cents >= 0 ? '+' : ''}{formatCurrency(t.amount_cents)}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(t.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-md border px-3 py-1 text-sm disabled:opacity-50">Anterior</button>
          <span className="text-sm text-gray-600">Pagina {page} de {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-md border px-3 py-1 text-sm disabled:opacity-50">Proxima</button>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Solicitar Saque</h3>
            <p className="mt-1 text-sm text-gray-500">Saldo disponivel: {formatCurrency(balanceCents)}</p>

            <form onSubmit={handleWithdraw} className="mt-4 space-y-4">
              {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-gray-500">R$</span>
                  <input type="number" min="10" step="0.01" required value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="10.00" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Chave PIX</label>
                <input type="text" required value={pixKey} onChange={(e) => setPixKey(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="CPF, email, telefone ou chave aleatoria" />
              </div>

              {withdrawAmount && parseFloat(withdrawAmount) >= 10 && (
                <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                  Voce recebera <strong>{formatCurrency(Math.round(parseFloat(withdrawAmount) * 100))}</strong> na chave PIX: <strong>{pixKey || '...'}</strong>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setShowWithdraw(false); setError(''); }} className="rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={withdrawing} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
                  {withdrawing ? 'Solicitando...' : 'Confirmar Saque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
