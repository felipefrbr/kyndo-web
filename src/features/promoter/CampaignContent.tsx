import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getCampaignContent, createPost, type PostItem } from '@/api/marketplace.api';
import { formatCurrency } from '@/lib/formatters';
import type { Campaign } from '@/types/campaign.types';

const platformOptions = [
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
];

export function CampaignContent() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contentUrl, setContentUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postUrl, setPostUrl] = useState('');
  const [platform, setPlatform] = useState('tiktok');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCampaignContent(id)
      .then((data) => {
        setCampaign(data.campaign);
        setContentUrl(data.content_url);
        setInstructions(data.content_instructions);
      })
      .finally(() => setLoading(false));
  }, [id]);

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

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
        <p className="mt-1 text-sm text-gray-500">Ganhe <strong>{formatCurrency(campaign.cpm_cents)}</strong> a cada 1.000 views</p>
      </div>

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
              <div className="mt-2 flex gap-2">
                {platformOptions.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPlatform(p.value)}
                    className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                      platform === p.value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {p.icon} {p.label}
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
    </div>
  );
}
