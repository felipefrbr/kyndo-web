import client from './client';
import type { Campaign, CampaignListResponse } from '@/types/campaign.types';

export interface UserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  balance_cents: number;
  created_at: string;
}

export interface UserListResponse {
  users: UserItem[];
  total: number;
  page: number;
  per_page: number;
}

export async function adminListCampaigns(status = '', page = 1, perPage = 10): Promise<CampaignListResponse> {
  const params: Record<string, any> = { page, per_page: perPage };
  if (status) params.status = status;
  const response = await client.get('/admin/campaigns', { params });
  return response.data;
}

export async function adminGetCampaign(id: string): Promise<{ campaign: Campaign }> {
  const response = await client.get(`/admin/campaigns/${id}`);
  return response.data;
}

export async function adminApproveCampaign(id: string): Promise<{ campaign: Campaign }> {
  const response = await client.post(`/admin/campaigns/${id}/approve`);
  return response.data;
}

export async function adminRejectCampaign(id: string, reason: string): Promise<{ campaign: Campaign }> {
  const response = await client.post(`/admin/campaigns/${id}/reject`, { reason });
  return response.data;
}

export async function adminListUsers(role = '', page = 1, perPage = 10): Promise<UserListResponse> {
  const params: Record<string, any> = { page, per_page: perPage };
  if (role) params.role = role;
  const response = await client.get('/admin/users', { params });
  return response.data;
}
