import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWallet, listTransactions, requestWithdrawal, listWithdrawals, adminListWithdrawals, adminApproveWithdrawal, adminRejectWithdrawal } from './wallet.api';
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

describe('wallet.api', () => {
  it('getWallet sends GET /wallet', async () => {
    mockedClient.get.mockResolvedValue({ data: { wallet: { id: 'w1', balance_cents: 5000 } } });

    const result = await getWallet();

    expect(mockedClient.get).toHaveBeenCalledWith('/wallet');
    expect(result.wallet.balance_cents).toBe(5000);
  });

  it('listTransactions sends GET /wallet/transactions with params', async () => {
    mockedClient.get.mockResolvedValue({ data: { transactions: [], total: 0, page: 1, per_page: 20 } });

    await listTransactions('view_earning', 2, 10);

    expect(mockedClient.get).toHaveBeenCalledWith('/wallet/transactions', {
      params: { page: 2, per_page: 10, tx_type: 'view_earning' },
    });
  });

  it('listTransactions omits empty tx_type', async () => {
    mockedClient.get.mockResolvedValue({ data: { transactions: [], total: 0, page: 1, per_page: 20 } });

    await listTransactions('', 1, 20);

    expect(mockedClient.get).toHaveBeenCalledWith('/wallet/transactions', {
      params: { page: 1, per_page: 20 },
    });
  });

  it('requestWithdrawal sends POST /withdrawals', async () => {
    mockedClient.post.mockResolvedValue({ data: { withdrawal: { id: 'wd1', amount_cents: 2000 } } });

    const result = await requestWithdrawal(2000, '11999999999');

    expect(mockedClient.post).toHaveBeenCalledWith('/withdrawals', {
      amount_cents: 2000, pix_key: '11999999999',
    });
    expect(result.withdrawal.amount_cents).toBe(2000);
  });

  it('listWithdrawals sends GET /withdrawals', async () => {
    mockedClient.get.mockResolvedValue({ data: { withdrawals: [] } });

    await listWithdrawals();

    expect(mockedClient.get).toHaveBeenCalledWith('/withdrawals');
  });

  it('adminListWithdrawals sends GET /admin/withdrawals with status filter', async () => {
    mockedClient.get.mockResolvedValue({ data: { withdrawals: [], total: 0, page: 1, per_page: 10 } });

    await adminListWithdrawals('pending', 1, 10);

    expect(mockedClient.get).toHaveBeenCalledWith('/admin/withdrawals', {
      params: { page: 1, per_page: 10, status: 'pending' },
    });
  });

  it('adminApproveWithdrawal sends POST /admin/withdrawals/:id/approve', async () => {
    mockedClient.post.mockResolvedValue({ data: { withdrawal: { status: 'processing' } } });

    await adminApproveWithdrawal('wd1');

    expect(mockedClient.post).toHaveBeenCalledWith('/admin/withdrawals/wd1/approve');
  });

  it('adminRejectWithdrawal sends POST with reason', async () => {
    mockedClient.post.mockResolvedValue({ data: { withdrawal: { status: 'rejected' } } });

    await adminRejectWithdrawal('wd1', 'invalid pix');

    expect(mockedClient.post).toHaveBeenCalledWith('/admin/withdrawals/wd1/reject', { reason: 'invalid pix' });
  });
});
