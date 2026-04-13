import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCampaign, listCampaigns, getCampaign, updateCampaign, submitCampaign, activateCampaign } from './campaigns.api';
import client from './client';

vi.mock('./client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

const mockedClient = vi.mocked(client);

beforeEach(() => {
  vi.clearAllMocks();
});

const fakeCampaign = {
  id: 'c1', creator_id: 'u1', title: 'Test', description: 'D',
  content_url: '', content_instructions: '', cover_image_url: '',
  budget_cents: 10000, cpm_cents: 500, spent_cents: 0,
  status: 'draft' as const, created_at: '', updated_at: '',
};

describe('campaigns.api', () => {
  it('createCampaign sends POST /campaigns', async () => {
    mockedClient.post.mockResolvedValue({ data: { campaign: fakeCampaign } });

    const result = await createCampaign({
      title: 'Test', description: 'D', content_url: '', content_instructions: '', cover_image_url: '',
      budget_cents: 10000, cpm_cents: 500,
    });

    expect(mockedClient.post).toHaveBeenCalledWith('/campaigns', expect.objectContaining({ title: 'Test' }));
    expect(result.campaign.id).toBe('c1');
  });

  it('listCampaigns sends GET /campaigns with pagination', async () => {
    mockedClient.get.mockResolvedValue({ data: { campaigns: [fakeCampaign], total: 1, page: 1, per_page: 10 } });

    const result = await listCampaigns(2, 20);

    expect(mockedClient.get).toHaveBeenCalledWith('/campaigns', { params: { page: 2, per_page: 20 } });
    expect(result.total).toBe(1);
  });

  it('getCampaign sends GET /campaigns/:id', async () => {
    mockedClient.get.mockResolvedValue({ data: { campaign: fakeCampaign } });

    const result = await getCampaign('c1');

    expect(mockedClient.get).toHaveBeenCalledWith('/campaigns/c1');
    expect(result.campaign.title).toBe('Test');
  });

  it('updateCampaign sends PUT /campaigns/:id', async () => {
    mockedClient.put.mockResolvedValue({ data: { campaign: { ...fakeCampaign, title: 'Updated' } } });

    const result = await updateCampaign('c1', { title: 'Updated' });

    expect(mockedClient.put).toHaveBeenCalledWith('/campaigns/c1', { title: 'Updated' });
    expect(result.campaign.title).toBe('Updated');
  });

  it('submitCampaign sends POST /campaigns/:id/submit', async () => {
    mockedClient.post.mockResolvedValue({ data: { campaign: { ...fakeCampaign, status: 'pending_approval' } } });

    const result = await submitCampaign('c1');

    expect(mockedClient.post).toHaveBeenCalledWith('/campaigns/c1/submit');
    expect(result.campaign.status).toBe('pending_approval');
  });

  it('activateCampaign sends POST /campaigns/:id/activate', async () => {
    mockedClient.post.mockResolvedValue({ data: { campaign: { ...fakeCampaign, status: 'active' } } });

    const result = await activateCampaign('c1');

    expect(mockedClient.post).toHaveBeenCalledWith('/campaigns/c1/activate');
    expect(result.campaign.status).toBe('active');
  });
});
