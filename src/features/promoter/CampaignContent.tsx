import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ExternalLink, Calendar, Clock, Wallet, CheckCircle2 } from 'lucide-react';
import { getCampaignContent, createPost, subscribeToCampaign, unsubscribeFromCampaign } from '@/api/marketplace.api';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { PlatformIcon, platformLabel } from '@/components/shared/PlatformIcon';
import type { Campaign, PlatformKey } from '@/types/campaign.types';

const PLATFORM_DOMAINS: Record<PlatformKey, string[]> = {
  tiktok: ['tiktok.com'],
  youtube: ['youtube.com', 'youtu.be'],
  instagram: ['instagram.com'],
};

function urlMatchesPlatform(url: string, platform: PlatformKey): boolean {
  const lower = url.toLowerCase();
  return PLATFORM_DOMAINS[platform]?.some((d) => lower.includes(d)) ?? false;
}

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
    try { await subscribeToCampaign(id); setIsSubscribed(true); } catch { alert('Erro ao se inscrever.'); } finally { setSubscribing(false); }
  };
  const handleUnsubscribe = async () => {
    if (!id) return;
    setSubscribing(true);
    try { await unsubscribeFromCampaign(id); setIsSubscribed(false); } catch { alert('Erro ao cancelar inscricao.'); } finally { setSubscribing(false); }
  };
  const urlMismatch = postUrl.length > 10 && !urlMatchesPlatform(postUrl, platform);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (urlMismatch) return;
    setSubmitting(true);
    try { await createPost(id, postUrl, platform); setSubmitted(true); setPostUrl(''); setShowPostForm(false); } catch { alert('Erro ao submeter post.'); } finally { setSubmitting(false); }
  };

  if (loading || !campaign) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  const spentPercent = campaign.budget_cents > 0 ? Math.min(100, Math.round((campaign.spent_cents / campaign.budget_cents) * 100)) : 0;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back link */}
      <Link to="/promoter/browse" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Marketplace
      </Link>

      {/* Hero section */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {campaign.cover_image_url ? (
          <div className="relative h-56 sm:h-72">
            <img src={campaign.cover_image_url} alt={campaign.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-2xl font-bold sm:text-3xl">{campaign.title}</h1>
              <p className="mt-1 text-sm text-white/80">A partir de <strong>{formatCurrency(campaign.cpm_cents)}</strong> por 1k views</p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{campaign.title}</h1>
            <p className="mt-1 text-sm text-gray-500">A partir de <strong>{formatCurrency(campaign.cpm_cents)}</strong> por 1k views</p>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <div className="flex items-center gap-3">
            {(campaign.platforms ?? []).map((p) => (
              <div key={p.platform} className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
                <PlatformIcon platform={p.platform} size={14} />
                <span className="text-xs font-medium text-gray-700">{formatCurrency(p.cpm_cents)}</span>
              </div>
            ))}
          </div>
          {isSubscribed ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm font-medium text-green-600"><CheckCircle2 className="h-4 w-4" /> Inscrito</span>
              <button onClick={handleUnsubscribe} disabled={subscribing} className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                Sair
              </button>
            </div>
          ) : (
            <button onClick={handleSubscribe} disabled={subscribing} className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
              {subscribing ? '...' : 'Inscrever-se'}
            </button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <Wallet className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Orcamento</p>
            <p className="text-sm font-bold text-gray-900">{formatCurrency(campaign.budget_cents)}</p>
            <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${spentPercent}%` }} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Inicio</p>
            <p className="text-sm font-semibold text-gray-900">{campaign.start_at ? formatDateTime(campaign.start_at) : 'Imediato'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Termino</p>
            <p className="text-sm font-semibold text-gray-900">{campaign.end_at ? formatDateTime(campaign.end_at) : 'Ate o saldo'}</p>
          </div>
        </div>
      </div>

      {/* Content area: two columns on desktop */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left: main content */}
        <div className="space-y-5 lg:col-span-2">
          {/* Description */}
          {campaign.description && (
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Sobre a campanha</h2>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-gray-700">{campaign.description}</p>
            </div>
          )}

          {/* Instructions */}
          {instructions && (
            <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-primary/70">Instrucoes para divulgadores</h2>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-gray-700">{instructions}</p>
            </div>
          )}

          {/* Content URL */}
          {contentUrl && (
            <a href={contentUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <ExternalLink className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">Conteudo Original</p>
                <p className="truncate text-xs text-primary">{contentUrl}</p>
              </div>
            </a>
          )}
        </div>

        {/* Right: sidebar */}
        <div className="space-y-5">
          {/* Submit post card */}
          {isSubscribed ? (
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900">Submeter Post</h2>
              <p className="mt-1 text-xs text-gray-500">Poste nas redes e informe o link aqui.</p>

              {submitted && (
                <div className="mt-3 rounded-lg bg-green-50 p-3 text-xs text-green-700">
                  Enviado! <Link to="/promoter/posts" className="font-medium underline">Ver meus posts</Link>
                </div>
              )}

              {!showPostForm ? (
                <button onClick={() => setShowPostForm(true)} className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
                  Submeter Link
                </button>
              ) : (
                <form onSubmit={handleSubmitPost} className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {(campaign.platforms ?? []).map((p) => (
                      <button key={p.platform} type="button" onClick={() => setPlatform(p.platform)}
                        className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                          platform === p.platform ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500'
                        }`}>
                        <PlatformIcon platform={p.platform} size={14} />
                        {platformLabel(p.platform)}
                      </button>
                    ))}
                  </div>
                  <div>
                    <input type="url" required value={postUrl} onChange={(e) => setPostUrl(e.target.value)}
                      className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                        urlMismatch
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-primary focus:ring-primary'
                      }`}
                      placeholder={`https://${PLATFORM_DOMAINS[platform]?.[0] ?? '...'}/...`} />
                    {urlMismatch && (
                      <p className="mt-1 text-xs text-red-600">
                        Este link nao parece ser do {platformLabel(platform)}. Verifique a URL ou selecione outra plataforma.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowPostForm(false)} className="flex-1 rounded-lg border px-3 py-2 text-xs text-gray-600 hover:bg-gray-50">Cancelar</button>
                    <button type="submit" disabled={submitting || urlMismatch} className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50">
                      {submitting ? '...' : 'Enviar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 text-center">
              <p className="text-sm font-medium text-gray-700">Quer divulgar essa campanha?</p>
              <p className="mt-1 text-xs text-gray-500">Inscreva-se para submeter posts e ganhar por views.</p>
              <button onClick={handleSubscribe} disabled={subscribing}
                className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
                {subscribing ? '...' : 'Inscrever-se nesta campanha'}
              </button>
            </div>
          )}

          {/* Earnings info */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Quanto voce ganha</h2>
            <div className="mt-3 space-y-2">
              {(campaign.platforms ?? []).map((p) => (
                <div key={p.platform} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={p.platform} size={16} />
                    <span className="text-sm text-gray-600">{platformLabel(p.platform)}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{formatCurrency(p.cpm_cents)}<span className="text-xs font-normal text-gray-400">/1k</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
