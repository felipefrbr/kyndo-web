export type CampaignStatus = 'draft' | 'pending_approval' | 'approved' | 'active' | 'scheduled' | 'paused' | 'exhausted' | 'rejected';

export type PlatformKey = 'tiktok' | 'youtube' | 'instagram';

export interface CampaignPlatform {
  platform: PlatformKey;
  cpm_cents: number;
}

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
  fee_cents: number;
  total_cents: number;
  fee_rate: number;
  status: CampaignStatus;
  rejection_reason?: string;
  paid_at?: string;
  approved_at?: string;
  start_at?: string | null;
  end_at?: string | null;
  platforms?: CampaignPlatform[];
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
  start_at?: string | null;
  end_at?: string | null;
  platforms: CampaignPlatform[];
}

export interface UpdateCampaignRequest {
  title?: string;
  description?: string;
  content_url?: string;
  content_instructions?: string;
  cover_image_url?: string;
  budget_cents?: number;
  start_at?: string | null;
  end_at?: string | null;
  platforms?: CampaignPlatform[];
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  total: number;
  page: number;
  per_page: number;
}
