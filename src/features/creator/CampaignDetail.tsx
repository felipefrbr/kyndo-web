import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Pencil, Send, ArrowLeft, Zap } from 'lucide-react';
import { getCampaign, submitCampaign, activateCampaign } from '@/api/campaigns.api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/formatters';
import { PlatformIcon, platformLabel } from '@/components/shared/PlatformIcon';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getWallet } from '@/api/wallet.api';
import type { Campaign } from '@/types/campaign.types';

export function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showActivate, setShowActivate] = useState(false);
  const [activating, setActivating] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  const openActivateModal = () => {
    getWallet().then((w) => setWalletBalance(w.wallet.balance_cents));
    setShowActivate(true);
  };

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    getCampaign(id)
      .then(({ campaign }) => setCampaign(campaign))
      .catch(() => navigate('/creator/campaigns'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(load, [load]);

  const handleSubmit = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      const { campaign } = await submitCampaign(id);
      setCampaign(campaign);
      setShowConfirm(false);
    } catch {
      alert('Erro ao enviar para aprovacao. Verifique se todos os campos estao preenchidos.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async () => {
    if (!id) return;
    setActivating(true);
    try {
      const { campaign } = await activateCampaign(id);
      setCampaign(campaign);
      setShowActivate(false);
    } catch {
      alert('Erro ao ativar campanha.');
    } finally {
      setActivating(false);
    }
  };

  if (loading || !campaign) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const spentPercent = campaign.budget_cents > 0
    ? Math.round((campaign.spent_cents / campaign.budget_cents) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/creator/campaigns" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Voltar para campanhas
      </Link>

      {/* Hero section */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {campaign.cover_image_url ? (
          <div className="relative h-56 sm:h-72">
            <img src={campaign.cover_image_url} alt={campaign.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold sm:text-3xl">{campaign.title}</h1>
                <StatusBadge status={campaign.status} />
              </div>
              <p className="mt-1 text-sm text-white/80">Criada em {formatDate(campaign.created_at)}</p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{campaign.title}</h1>
              <StatusBadge status={campaign.status} />
            </div>
            <p className="mt-1 text-sm text-gray-500">Criada em {formatDate(campaign.created_at)}</p>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
          {campaign.status !== 'exhausted' && campaign.status !== 'pending_approval' && (
            <Link
              to={`/creator/campaigns/${campaign.id}/edit`}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-shadow hover:shadow-md"
            >
              <Pencil className="h-4 w-4" /> Editar
            </Link>
          )}
          {campaign.status === 'draft' && (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md hover:bg-primary/90"
            >
              <Send className="h-4 w-4" /> Enviar para Aprovacao
            </button>
          )}
          {campaign.status === 'approved' && (
            <button
              onClick={openActivateModal}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md hover:bg-green-700"
            >
              <Zap className="h-4 w-4" /> Ativar Campanha ({formatCurrency(campaign.total_cents)})
            </button>
          )}
        </div>
      </div>

      {/* Status banners */}
      {campaign.status === 'rejected' && campaign.rejection_reason && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-red-800">Motivo da rejeicao:</p>
          <p className="mt-1 text-sm text-red-700">{campaign.rejection_reason}</p>
        </div>
      )}

      {campaign.status === 'pending_approval' && (
        <div className="mt-6 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700 shadow-sm">
          Sua campanha esta sendo analisada. Voce sera notificado quando for aprovada.
        </div>
      )}

      {campaign.status === 'approved' && (
        <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-700 shadow-sm">
          Sua campanha foi aprovada! Clique em <strong>"Ativar Campanha"</strong> para realizar o pagamento e disponibiliza-la para os divulgadores.
        </div>
      )}

      {campaign.status === 'active' && (
        <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-700 shadow-sm">
          Campanha ativa! Divulgadores podem se inscrever e comecar a divulgar seu conteudo.
        </div>
      )}

      {campaign.status === 'scheduled' && campaign.start_at && (
        <div className="mt-6 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-700 shadow-sm">
          Campanha agendada para iniciar em <strong>{formatDateTime(campaign.start_at)}</strong>.
        </div>
      )}

      {/* Two-column layout: main content left, sidebar right */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left column - main content */}
        <div className="space-y-5 lg:col-span-2">
          {/* Description */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Descricao</h2>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-gray-700">{campaign.description || 'Sem descricao'}</p>
          </div>

          {/* Content URL */}
          {campaign.content_url && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">URL do Conteudo</h2>
              <a href={campaign.content_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-primary hover:underline break-all">
                {campaign.content_url}
              </a>
            </div>
          )}

          {/* Instructions */}
          {campaign.content_instructions && (
            <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-primary/70">Instrucoes para Divulgadores</h2>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-gray-700">{campaign.content_instructions}</p>
            </div>
          )}

          {/* CPM per platform */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Valor por 1.000 views</h2>
            <div className="mt-3 space-y-2">
              {(campaign.platforms ?? []).map((p) => (
                <div key={p.platform} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5">
                  <span className="flex items-center gap-2 text-sm text-gray-700">
                    <PlatformIcon platform={p.platform} size={16} />
                    {platformLabel(p.platform)}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(p.cpm_cents)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - sidebar */}
        <div className="space-y-5">
          {/* Budget card */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Orcamento</h2>
            <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(campaign.budget_cents)}</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Gasto: {formatCurrency(campaign.spent_cents)}</span>
                <span>{spentPercent}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${spentPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Schedule card */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Periodo</h2>
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-xs text-gray-400">Inicio</p>
                <p className="text-sm font-semibold text-gray-900">
                  {campaign.start_at ? formatDateTime(campaign.start_at) : 'Imediato ao ativar'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Termino</p>
                <p className="text-sm font-semibold text-gray-900">
                  {campaign.end_at ? formatDateTime(campaign.end_at) : 'Enquanto houver saldo'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="h-1 bg-gradient-to-r from-primary to-primary/60" />
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900">Enviar para Aprovacao?</h3>
              <p className="mt-2 text-sm text-gray-600">
                Sua campanha sera analisada pela equipe. Apos aprovada, voce podera ativa-la realizando o pagamento.
              </p>
              <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm">
                <p><strong>Titulo:</strong> {campaign.title}</p>
                <p><strong>Orcamento:</strong> {formatCurrency(campaign.budget_cents)}</p>
                <p><strong>CPM:</strong> {formatCurrency(campaign.cpm_cents)}</p>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : 'Confirmar Envio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activate Modal */}
      {showActivate && (() => {
        const insufficientActivate = campaign.total_cents > walletBalance;
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="h-1.5 bg-gradient-to-r from-green-500 to-green-400" />
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900">Ativar Campanha?</h3>
              <p className="mt-2 text-sm text-gray-600">
                O valor sera debitado da sua carteira e a campanha ficara disponivel para os divulgadores.
              </p>
              <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-600">Orcamento</span>
                  <span className="font-medium text-gray-900">{formatCurrency(campaign.budget_cents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa ({(campaign.fee_rate * 100).toFixed(0)}%)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(campaign.fee_cents)}</span>
                </div>
                <div className="flex justify-between border-t pt-1.5 mt-1.5">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">{formatCurrency(campaign.total_cents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Seu saldo</span>
                  <span className={`font-medium ${insufficientActivate ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(walletBalance)}</span>
                </div>
              </div>
              {insufficientActivate && (
                <p className="mt-3 text-xs font-medium text-red-600">Saldo insuficiente. Deposite mais fundos antes de ativar.</p>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowActivate(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md">
                  Cancelar
                </button>
                <button onClick={handleActivate} disabled={activating || insufficientActivate} className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md hover:bg-green-700 disabled:opacity-50">
                  {activating ? 'Ativando...' : `Pagar ${formatCurrency(campaign.total_cents)} e Ativar`}
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
