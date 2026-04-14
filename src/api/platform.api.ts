import client from './client';

export interface PlatformConfig {
  fee_rate: number;
}

export async function getPlatformConfig(): Promise<PlatformConfig> {
  const { data } = await client.get('/platform/config');
  return data;
}
