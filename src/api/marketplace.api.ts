import client from './client';
import type { Campaign, CampaignPlatform } from '@/types/campaign.types';

export interface MarketplaceCampaign {
  id: string;
  creator_id: string;
  creator_name: string;
  title: string;
  description: string;
  cover_image_url: string;
  budget_cents: number;
  cpm_cents: number;
  spent_cents: number;
  status: 'active' | 'scheduled';
  start_at?: string | null;
  end_at?: string | null;
  platforms?: CampaignPlatform[];
  is_subscribed: boolean;
  created_at: string;
}

export interface MarketplaceListResponse {
  campaigns: MarketplaceCampaign[];
  total: number;
  page: number;
  per_page: number;
}

export async function listMarketplaceCampaigns(search = '', page = 1, perPage = 10): Promise<MarketplaceListResponse> {
  const params: Record<string, string | number> = { page, per_page: perPage };
  if (search) params.search = search;
  const response = await client.get('/marketplace/campaigns', { params });
  return response.data;
}

export async function subscribeToCampaign(campaignId: string): Promise<unknown> {
  const response = await client.post(`/campaigns/${campaignId}/subscribe`);
  return response.data;
}

export async function getCampaignContent(campaignId: string): Promise<{ content_url: string; content_instructions: string; campaign: Campaign }> {
  const response = await client.get(`/campaigns/${campaignId}/content`);
  return response.data;
}

export interface PostItem {
  id: string;
  subscription_id: string;
  promoter_id: string;
  campaign_id: string;
  platform: string;
  post_url: string;
  status: string;
  last_known_views: number;
  paid_views: number;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface PostListResponse {
  posts: PostItem[];
  total: number;
  page: number;
  per_page: number;
}

export async function createPost(campaignId: string, postUrl: string, platform: string): Promise<{ post: PostItem }> {
  const response = await client.post('/posts', { campaign_id: campaignId, post_url: postUrl, platform });
  return response.data;
}

export async function listPosts(campaignId?: string, page = 1, perPage = 10): Promise<PostListResponse> {
  const params: Record<string, string | number> = { page, per_page: perPage };
  if (campaignId) params.campaign_id = campaignId;
  const response = await client.get('/posts', { params });
  return response.data;
}

export async function deletePost(id: string): Promise<void> {
  await client.delete(`/posts/${id}`);
}
