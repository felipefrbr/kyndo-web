export type CampaignStatus = 'draft' | 'pending_approval' | 'approved' | 'active' | 'paused' | 'exhausted' | 'rejected';

export interface Campaign {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  content_url: string;
  content_instructions: string;
  cover_image_url: string;
  budget_cents: number;
  cpm_cents: number;
  spent_cents: number;
  status: CampaignStatus;
  rejection_reason?: string;
  paid_at?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignRequest {
  title: string;
  description: string;
  content_url: string;
  content_instructions: string;
  cover_image_url: string;
  budget_cents: number;
  cpm_cents: number;
}

export interface UpdateCampaignRequest {
  title?: string;
  description?: string;
  content_url?: string;
  content_instructions?: string;
  cover_image_url?: string;
  budget_cents?: number;
  cpm_cents?: number;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  total: number;
  page: number;
  per_page: number;
}
