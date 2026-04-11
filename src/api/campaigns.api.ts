import client from './client';
import type { Campaign, CampaignListResponse, CreateCampaignRequest, UpdateCampaignRequest } from '@/types/campaign.types';

export async function createCampaign(data: CreateCampaignRequest): Promise<{ campaign: Campaign }> {
  const response = await client.post('/campaigns', data);
  return response.data;
}

export async function listCampaigns(page = 1, perPage = 10): Promise<CampaignListResponse> {
  const response = await client.get('/campaigns', { params: { page, per_page: perPage } });
  return response.data;
}

export async function getCampaign(id: string): Promise<{ campaign: Campaign }> {
  const response = await client.get(`/campaigns/${id}`);
  return response.data;
}

export async function updateCampaign(id: string, data: UpdateCampaignRequest): Promise<{ campaign: Campaign }> {
  const response = await client.put(`/campaigns/${id}`, data);
  return response.data;
}

export async function submitCampaign(id: string): Promise<{ campaign: Campaign }> {
  const response = await client.post(`/campaigns/${id}/submit`);
  return response.data;
}

export async function activateCampaign(id: string): Promise<{ campaign: Campaign }> {
  const response = await client.post(`/campaigns/${id}/activate`);
  return response.data;
}
