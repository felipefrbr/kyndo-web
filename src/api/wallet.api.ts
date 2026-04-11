import client from './client';

export interface Wallet {
  id: string;
  user_id: string;
  balance_cents: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  amount_cents: number;
  tx_type: string;
  reference_id?: string;
  description: string;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  wallet_id: string;
  amount_cents: number;
  status: string;
  pix_key: string;
  admin_notes?: string;
  created_at: string;
}

export async function getWallet(): Promise<{ wallet: Wallet }> {
  const { data } = await client.get('/wallet');
  return data;
}

export async function listTransactions(txType = '', page = 1, perPage = 20) {
  const params: Record<string, any> = { page, per_page: perPage };
  if (txType) params.tx_type = txType;
  const { data } = await client.get('/wallet/transactions', { params });
  return data as { transactions: WalletTransaction[]; total: number; page: number; per_page: number };
}

export async function requestWithdrawal(amountCents: number, pixKey: string): Promise<{ withdrawal: Withdrawal }> {
  const { data } = await client.post('/withdrawals', { amount_cents: amountCents, pix_key: pixKey });
  return data;
}

export async function listWithdrawals(): Promise<{ withdrawals: Withdrawal[] }> {
  const { data } = await client.get('/withdrawals');
  return data;
}

// Admin
export async function adminListWithdrawals(status = '', page = 1, perPage = 10) {
  const params: Record<string, any> = { page, per_page: perPage };
  if (status) params.status = status;
  const { data } = await client.get('/admin/withdrawals', { params });
  return data as { withdrawals: Withdrawal[]; total: number; page: number; per_page: number };
}

export async function adminApproveWithdrawal(id: string) {
  const { data } = await client.post(`/admin/withdrawals/${id}/approve`);
  return data;
}

export async function adminCompleteWithdrawal(id: string) {
  const { data } = await client.post(`/admin/withdrawals/${id}/complete`);
  return data;
}

export async function adminRejectWithdrawal(id: string, reason: string) {
  const { data } = await client.post(`/admin/withdrawals/${id}/reject`, { reason });
  return data;
}
