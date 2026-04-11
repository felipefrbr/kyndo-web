import client from './client';

export interface CreatorStats {
  total_campaigns: number;
  active_campaigns: number;
  total_views: number;
  total_invested: number;
}

export interface PromoterStats {
  active_subscriptions: number;
  total_posts: number;
  total_views: number;
  total_earned: number;
  balance_cents: number;
}

export interface AdminStats {
  total_users: number;
  creators: number;
  promoters: number;
  total_campaigns: number;
  active_campaigns: number;
  pending_campaigns: number;
  total_posts: number;
  monitoring_posts: number;
  pending_withdrawals: number;
  processed_withdrawals: number;
}

export async function getCreatorDashboard(): Promise<CreatorStats> {
  const { data } = await client.get('/dashboard/creator');
  return data;
}

export async function getPromoterDashboard(): Promise<PromoterStats> {
  const { data } = await client.get('/dashboard/promoter');
  return data;
}

export async function getAdminDashboard(): Promise<AdminStats> {
  const { data } = await client.get('/admin/dashboard');
  return data;
}
