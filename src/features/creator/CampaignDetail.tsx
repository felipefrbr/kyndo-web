import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Pencil, Send, ArrowLeft, Zap } from 'lucide-react';
import { getCampaign, submitCampaign, activateCampaign } from '@/api/campaigns.api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { StatusBadge } from '@/components/shared/StatusBadge';
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
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/creator/campaigns" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Voltar para campanhas
      </Link>

      {campaign.cover_image_url && (
        <img src={campaign.cover_image_url} alt={campaign.title} className="w-full rounded-lg object-cover max-h-80" />
      )}

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="mt-1 text-sm text-gray-500">Criada em {formatDate(campaign.created_at)}</p>
        </div>

        <div className="flex gap-2">
          {(campaign.status === 'draft' || campaign.status === 'rejected') && (
            <Link
              to={`/creator/campaigns/${campaign.id}/edit`}
              className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" /> Editar
            </Link>
          )}
          {campaign.status === 'draft' && (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              <Send className="h-4 w-4" /> Enviar para Aprovacao
            </button>
          )}
          {campaign.status === 'approved' && (
            <button
              onClick={() => setShowActivate(true)}
              className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <Zap className="h-4 w-4" /> Ativar Campanha ({formatCurrency(campaign.budget_cents)})
            </button>
          )}
        </div>
      </div>

      {campaign.status === 'rejected' && campaign.rejection_reason && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Motivo da rejeicao:</p>
          <p className="mt-1 text-sm text-red-700">{campaign.rejection_reason}</p>
        </div>
      )}

      {campaign.status === 'pending_approval' && (
        <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-700">
          Sua campanha esta sendo analisada. Voce sera notificado quando for aprovada.
        </div>
      )}

      {campaign.status === 'approved' && (
        <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700">
          Sua campanha foi aprovada! Clique em <strong>"Ativar Campanha"</strong> para realizar o pagamento e disponibiliza-la para os divulgadores.
        </div>
      )}

      {campaign.status === 'active' && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
          Campanha ativa! Divulgadores podem se inscrever e comecar a divulgar seu conteudo.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-5">
          <h2 className="text-sm font-medium text-gray-500">Orcamento</h2>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(campaign.budget_cents)}</p>
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

        <div className="rounded-lg border bg-white p-5">
          <h2 className="text-sm font-medium text-gray-500">CPM (Valor por 1.000 views)</h2>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(campaign.cpm_cents)}</p>
          <p className="mt-2 text-sm text-gray-500">
            {campaign.cpm_cents > 0 ? Math.floor(campaign.budget_cents / campaign.cpm_cents) : 0} pagamentos possiveis
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5">
        <h2 className="mb-3 text-sm font-medium text-gray-500">Descricao</h2>
        <p className="text-gray-900 whitespace-pre-wrap">{campaign.description || 'Sem descricao'}</p>
      </div>

      {campaign.content_url && (
        <div className="rounded-lg border bg-white p-5">
          <h2 className="mb-3 text-sm font-medium text-gray-500">URL do Conteudo</h2>
          <a href={campaign.content_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
            {campaign.content_url}
          </a>
        </div>
      )}

      {campaign.content_instructions && (
        <div className="rounded-lg border bg-white p-5">
          <h2 className="mb-3 text-sm font-medium text-gray-500">Instrucoes para Divulgadores</h2>
          <p className="text-gray-900 whitespace-pre-wrap">{campaign.content_instructions}</p>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Enviar para Aprovacao?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Sua campanha sera analisada pela equipe. Apos aprovada, voce podera ativa-la realizando o pagamento.
            </p>
            <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm">
              <p><strong>Titulo:</strong> {campaign.title}</p>
              <p><strong>Orcamento:</strong> {formatCurrency(campaign.budget_cents)}</p>
              <p><strong>CPM:</strong> {formatCurrency(campaign.cpm_cents)}</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Confirmar Envio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate Modal */}
      {showActivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Ativar Campanha?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Ao ativar, o valor do orcamento sera debitado e sua campanha ficara disponivel para os divulgadores.
            </p>
            <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm">
              <p><strong>Titulo:</strong> {campaign.title}</p>
              <p><strong>Valor a pagar:</strong> {formatCurrency(campaign.budget_cents)}</p>
              <p><strong>CPM:</strong> {formatCurrency(campaign.cpm_cents)}</p>
              <p><strong>Pagamentos:</strong> {campaign.cpm_cents > 0 ? Math.floor(campaign.budget_cents / campaign.cpm_cents) : 0}x de {formatCurrency(campaign.cpm_cents)} (a cada 1.000 views)</p>
            </div>
            <p className="mt-3 text-xs text-gray-400">No PoC, o pagamento e simulado.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowActivate(false)} className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleActivate} disabled={activating} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                {activating ? 'Ativando...' : `Pagar ${formatCurrency(campaign.budget_cents)} e Ativar`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
