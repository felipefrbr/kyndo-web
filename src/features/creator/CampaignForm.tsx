import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { isAxiosError } from 'axios';
import { createCampaign, getCampaign, updateCampaign } from '@/api/campaigns.api';
import { toDatetimeLocalValue } from '@/lib/formatters';
import { ImageUpload } from '@/components/shared/ImageUpload';
import type { PlatformKey } from '@/types/campaign.types';

const PLATFORM_LABELS: Record<PlatformKey, { label: string; icon: string }> = {
  tiktok: { label: 'TikTok', icon: '🎵' },
  youtube: { label: 'YouTube', icon: '▶️' },
  instagram: { label: 'Instagram', icon: '📷' },
};

export function CampaignForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [contentInstructions, setContentInstructions] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [budgetReais, setBudgetReais] = useState('');
  // Per-platform state: CPM in "reais" string per platform; checkbox controls inclusion
  const [platformEnabled, setPlatformEnabled] = useState<Record<PlatformKey, boolean>>({
    tiktok: true, youtube: false, instagram: false,
  });
  const [platformCpm, setPlatformCpm] = useState<Record<PlatformKey, string>>({
    tiktok: '', youtube: '', instagram: '',
  });
  const [startMode, setStartMode] = useState<'immediate' | 'scheduled'>('immediate');
  const [endMode, setEndMode] = useState<'budget' | 'date'>('budget');
  const [startAtLocal, setStartAtLocal] = useState('');
  const [endAtLocal, setEndAtLocal] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);

  useEffect(() => {
    if (!id) return;
    getCampaign(id)
      .then(({ campaign }) => {
        setTitle(campaign.title);
        setDescription(campaign.description);
        setContentUrl(campaign.content_url);
        setContentInstructions(campaign.content_instructions);
        setCoverImageUrl(campaign.cover_image_url || '');
        setBudgetReais((campaign.budget_cents / 100).toFixed(2));
        if (campaign.platforms && campaign.platforms.length > 0) {
          const enabled: Record<PlatformKey, boolean> = { tiktok: false, youtube: false, instagram: false };
          const cpms: Record<PlatformKey, string> = { tiktok: '', youtube: '', instagram: '' };
          for (const p of campaign.platforms) {
            enabled[p.platform] = true;
            cpms[p.platform] = (p.cpm_cents / 100).toFixed(2);
          }
          setPlatformEnabled(enabled);
          setPlatformCpm(cpms);
        }
        if (campaign.start_at) {
          setStartMode('scheduled');
          setStartAtLocal(toDatetimeLocalValue(new Date(campaign.start_at)));
        }
        if (campaign.end_at) {
          setEndMode('date');
          setEndAtLocal(toDatetimeLocalValue(new Date(campaign.end_at)));
        }
      })
      .catch(() => navigate('/creator/campaigns'))
      .finally(() => setLoadingData(false));
  }, [id, navigate]);

  const budgetCents = Math.round(parseFloat(budgetReais || '0') * 100);

  const selectedPlatforms = (['tiktok', 'youtube', 'instagram'] as PlatformKey[])
    .filter((k) => platformEnabled[k])
    .map((k) => ({
      platform: k,
      cpm_cents: Math.round(parseFloat(platformCpm[k] || '0') * 100),
    }));

  const platformsValid = selectedPlatforms.length > 0 && selectedPlatforms.every((p) => p.cpm_cents > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!platformsValid) {
      setError('Selecione pelo menos uma rede social e defina um CPM > 0 para cada.');
      return;
    }

    setLoading(true);

    // Convert datetime-local to ISO 8601; empty string signals "clear"
    const startAtISO = startMode === 'scheduled' && startAtLocal
      ? new Date(startAtLocal).toISOString()
      : '';
    const endAtISO = endMode === 'date' && endAtLocal
      ? new Date(endAtLocal).toISOString()
      : '';

    const data = {
      title,
      description,
      content_url: contentUrl,
      content_instructions: contentInstructions,
      cover_image_url: coverImageUrl,
      budget_cents: budgetCents,
      start_at: startAtISO || null,
      end_at: endAtISO || null,
      platforms: selectedPlatforms,
    };

    try {
      if (isEditing) {
        await updateCampaign(id, data);
      } else {
        await createCampaign(data);
      }
      navigate('/creator/campaigns');
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error.message);
      } else {
        setError('Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {isEditing ? 'Editar Campanha' : 'Criar Campanha'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-white p-6">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <ImageUpload value={coverImageUrl} onChange={setCoverImageUrl} />

        <div>
          <label className="block text-sm font-medium text-gray-700">Titulo *</label>
          <input
            type="text"
            required
            maxLength={255}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Nome da sua campanha"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descricao</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Descreva sua campanha para atrair divulgadores"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">URL do Conteudo</label>
          <input
            type="url"
            value={contentUrl}
            onChange={(e) => setContentUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Instrucoes para Divulgadores</label>
          <textarea
            rows={3}
            value={contentInstructions}
            onChange={(e) => setContentInstructions(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Ex: Faca um react divertido, corte os melhores momentos..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Orcamento Total (R$) *</label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-2 text-gray-500">R$</span>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={budgetReais}
              onChange={(e) => setBudgetReais(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="100.00"
            />
          </div>
        </div>

        <div className="space-y-3 rounded-md border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Redes Sociais e Valores</h3>
          <p className="text-xs text-gray-500">Selecione pelo menos uma rede e defina quanto vai pagar a cada 1.000 views em cada uma.</p>
          {(['tiktok', 'youtube', 'instagram'] as PlatformKey[]).map((k) => (
            <div key={k} className="flex items-center gap-3">
              <label className="flex min-w-[140px] items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={platformEnabled[k]}
                  onChange={(e) => setPlatformEnabled((prev) => ({ ...prev, [k]: e.target.checked }))}
                />
                <span>{PLATFORM_LABELS[k].icon} {PLATFORM_LABELS[k].label}</span>
              </label>
              <div className="relative flex-1">
                <span className="absolute left-3 top-2 text-gray-500">R$</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  disabled={!platformEnabled[k]}
                  value={platformCpm[k]}
                  onChange={(e) => setPlatformCpm((prev) => ({ ...prev, [k]: e.target.value }))}
                  className="block w-full rounded-md border border-gray-300 py-1.5 pl-10 pr-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="5.00"
                />
              </div>
              <span className="text-xs text-gray-400">/ 1k views</span>
            </div>
          ))}
        </div>

        <div className="space-y-4 rounded-md border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Agendamento</h3>

          <div>
            <p className="text-sm font-medium text-gray-700">Inicio</p>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="radio" name="startMode" checked={startMode === 'immediate'} onChange={() => setStartMode('immediate')} />
                Iniciar imediatamente ao ativar
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="radio" name="startMode" checked={startMode === 'scheduled'} onChange={() => setStartMode('scheduled')} />
                Agendar inicio
              </label>
              {startMode === 'scheduled' && (
                <input
                  type="datetime-local"
                  value={startAtLocal}
                  onChange={(e) => setStartAtLocal(e.target.value)}
                  className="ml-6 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">Termino</p>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="radio" name="endMode" checked={endMode === 'budget'} onChange={() => setEndMode('budget')} />
                Enquanto houver saldo
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="radio" name="endMode" checked={endMode === 'date'} onChange={() => setEndMode('date')} />
                Terminar em uma data
              </label>
              {endMode === 'date' && (
                <input
                  type="datetime-local"
                  value={endAtLocal}
                  onChange={(e) => setEndAtLocal(e.target.value)}
                  className="ml-6 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/creator/campaigns')}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !platformsValid || budgetCents <= 0}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : isEditing ? 'Salvar Alteracoes' : 'Salvar Rascunho'}
          </button>
        </div>
      </form>
    </div>
  );
}
