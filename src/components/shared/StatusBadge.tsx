import type { CampaignStatus } from '@/types/campaign.types';

const statusConfig: Record<CampaignStatus, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700' },
  pending_approval: { label: 'Aguardando Aprovacao', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Aprovada', color: 'bg-blue-100 text-blue-700' },
  active: { label: 'Ativa', color: 'bg-green-100 text-green-700' },
  scheduled: { label: 'Agendada', color: 'bg-indigo-100 text-indigo-700' },
  paused: { label: 'Pausada', color: 'bg-orange-100 text-orange-700' },
  exhausted: { label: 'Encerrada', color: 'bg-purple-100 text-purple-700' },
  rejected: { label: 'Rejeitada', color: 'bg-red-100 text-red-700' },
};

export function StatusBadge({ status }: { status: CampaignStatus }) {
  const config = statusConfig[status] ?? { label: status, color: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
