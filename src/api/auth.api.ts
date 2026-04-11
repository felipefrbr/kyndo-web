import client from './client';
import type { AuthTokens, LoginRequest, SignupRequest, User } from '@/types/auth.types';

export async function signup(data: SignupRequest): Promise<{ user: User }> {
  const response = await client.post('/auth/signup', data);
  return response.data;
}

export async function login(data: LoginRequest): Promise<AuthTokens> {
  const response = await client.post('/auth/login', data);
  return response.data;
}

export async function getMe(): Promise<{ user: User }> {
  const response = await client.get('/auth/me');
  return response.data;
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}
