import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signup, login, getMe, logout } from './auth.api';
import client from './client';

vi.mock('./client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockedClient = vi.mocked(client);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('auth.api', () => {
  describe('signup', () => {
    it('sends POST /auth/signup with correct data', async () => {
      const user = { id: '1', email: 'test@test.com', name: 'Test', role: 'creator' as const, created_at: '', updated_at: '' };
      mockedClient.post.mockResolvedValue({ data: { user } });

      const result = await signup({ email: 'test@test.com', password: 'pass123', name: 'Test', role: 'creator' });

      expect(mockedClient.post).toHaveBeenCalledWith('/auth/signup', {
        email: 'test@test.com', password: 'pass123', name: 'Test', role: 'creator',
      });
      expect(result.user.email).toBe('test@test.com');
    });
  });

  describe('login', () => {
    it('sends POST /auth/login and returns tokens', async () => {
      const data = {
        access_token: 'at', refresh_token: 'rt',
        user: { id: '1', email: 'test@test.com', name: 'Test', role: 'creator' as const, created_at: '', updated_at: '' },
      };
      mockedClient.post.mockResolvedValue({ data });

      const result = await login({ email: 'test@test.com', password: 'pass' });

      expect(mockedClient.post).toHaveBeenCalledWith('/auth/login', { email: 'test@test.com', password: 'pass' });
      expect(result.access_token).toBe('at');
      expect(result.refresh_token).toBe('rt');
    });
  });

  describe('getMe', () => {
    it('sends GET /auth/me', async () => {
      const user = { id: '1', email: 'test@test.com', name: 'Test', role: 'creator' as const, created_at: '', updated_at: '' };
      mockedClient.get.mockResolvedValue({ data: { user } });

      const result = await getMe();

      expect(mockedClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result.user.id).toBe('1');
    });
  });

  describe('logout', () => {
    it('sends POST /auth/logout', async () => {
      mockedClient.post.mockResolvedValue({ data: {} });

      await logout();

      expect(mockedClient.post).toHaveBeenCalledWith('/auth/logout');
    });
  });
});
