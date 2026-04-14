import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getCampaignContent, createPost, subscribeToCampaign, unsubscribeFromCampaign } from '@/api/marketplace.api';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { PlatformIcon, platformLabel } from '@/components/shared/PlatformIcon';
import type { Campaign, PlatformKey } from '@/types/campaign.types';

export function CampaignContent() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contentUrl, setContentUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postUrl, setPostUrl] = useState('');
  const [platform, setPlatform] = useState<PlatformKey>('tiktok');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCampaignContent(id)
      .then((data) => {
        setCampaign(data.campaign);
        setContentUrl(data.content_url);
        setInstructions(data.content_instructions);
        setIsSubscribed(data.is_subscribed);
        const first = data.campaign.platforms?.[0]?.platform;
        if (first) setPlatform(first);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubscribe = async () => {
    if (!id) return;
    setSubscribing(true);
    try {
      await subscribeToCampaign(id);
      setIsSubscribed(true);
    } catch {
      alert('Erro ao se inscrever.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!id) return;
    setSubscribing(true);
    try {
      await unsubscribeFromCampaign(id);
      setIsSubscribed(false);
    } catch {
      alert('Erro ao cancelar inscricao.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await createPost(id, postUrl, platform);
      setSubmitted(true);
      setPostUrl('');
      setShowPostForm(false);
    } catch {
      alert('Erro ao submeter post.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !campaign) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/promoter/browse" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Voltar ao marketplace
      </Link>

      {campaign.cover_image_url && (
        <img src={campaign.cover_image_url} alt={campaign.title} className="w-full rounded-lg object-cover max-h-64" />
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
          <p className="mt-1 text-sm text-gray-500">A partir de <strong>{formatCurrency(campaign.cpm_cents)}</strong> a cada 1.000 views</p>
        </div>
        <div>
          {isSubscribed ? (
            <button
              onClick={handleUnsubscribe}
              disabled={subscribing}
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {subscribing ? '...' : 'Cancelar Inscricao'}
            </button>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {subscribing ? '...' : 'Inscrever-se'}
            </button>
          )}
        </div>
      </div>

      {/* Key info cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-gray-500">Orcamento Total</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(campaign.budget_cents)}</p>
          {campaign.budget_cents > 0 && campaign.spent_cents > 0 && (
            <p className="mt-1 text-xs text-gray-400">{Math.round((campaign.spent_cents / campaign.budget_cents) * 100)}% utilizado</p>
          )}
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-gray-500">Inicio</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {campaign.start_at ? formatDateTime(campaign.start_at) : 'Imediato'}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-gray-500">Termino</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {campaign.end_at ? formatDateTime(campaign.end_at) : 'Ate acabar o saldo'}
          </p>
        </div>
      </div>

      {/* Platforms and CPMs */}
      {campaign.platforms && campaign.platforms.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {campaign.platforms.map((p) => (
            <div key={p.platform} className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2">
              <PlatformIcon platform={p.platform} size={18} />
              <span className="text-sm font-medium">{platformLabel(p.platform)}</span>
              <span className="text-sm font-bold text-primary">{formatCurrency(p.cpm_cents)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border bg-white p-5">
        <h2 className="mb-3 text-sm font-medium text-gray-500">Descricao</h2>
        <p className="whitespace-pre-wrap text-gray-900">{campaign.description}</p>
      </div>

      <div className="rounded-lg border bg-white p-5">
        <h2 className="mb-3 text-sm font-medium text-gray-500">Conteudo Original</h2>
        <a href={contentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
          <ExternalLink className="h-4 w-4" /> {contentUrl}
        </a>
      </div>

      {instructions && (
        <div className="rounded-lg border bg-white p-5">
          <h2 className="mb-3 text-sm font-medium text-gray-500">Instrucoes</h2>
          <p className="whitespace-pre-wrap text-gray-900">{instructions}</p>
        </div>
      )}

      {submitted && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
          Post submetido com sucesso! Aguarde a aprovacao do admin. <Link to="/promoter/posts" className="font-medium underline">Ver meus posts</Link>
        </div>
      )}

      {/* Post submission — only for subscribed users */}
      {isSubscribed && (
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">Submeter Post</h2>
            {!showPostForm && (
              <button onClick={() => setShowPostForm(true)} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                Submeter Link
              </button>
            )}
          </div>

          {showPostForm && (
            <form onSubmit={handleSubmitPost} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plataforma</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(campaign.platforms ?? []).map((p) => (
                    <button
                      key={p.platform}
                      type="button"
                      onClick={() => setPlatform(p.platform)}
                      className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                        platform === p.platform ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      <PlatformIcon platform={p.platform} size={18} />
                      <span>{platformLabel(p.platform)}</span>
                      <span className="text-xs text-gray-500">{formatCurrency(p.cpm_cents)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">URL do Post</label>
                <input
                  type="url"
                  required
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="https://tiktok.com/@seu-usuario/video/..."
                />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setShowPostForm(false)} className="rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={submitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
                  {submitting ? 'Enviando...' : 'Enviar Post'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {!isSubscribed && (
        <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700">
          Inscreva-se nesta campanha para submeter posts e ganhar por visualizacoes.
        </div>
      )}
    </div>
  );
}
