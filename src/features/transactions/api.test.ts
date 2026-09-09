import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/client', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import { api } from '../../api/client';
import { transactionsApi } from './api';

describe('transactionsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll llama GET /transactions con los filtros como params', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { transactions: [], total: 0 } });

    await transactionsApi.getAll({ accountId: 'acc-1' });

    expect(api.get).toHaveBeenCalledWith('/transactions', { params: { accountId: 'acc-1' } });
  });

  it('getById llama GET /transactions/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { id: 'tx-1' } });

    await transactionsApi.getById('tx-1');

    expect(api.get).toHaveBeenCalledWith('/transactions/tx-1');
  });

  it('create llama POST /transactions con el body', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'tx-1' } });
    const input = {
      amount: 50,
      type: 'expense' as const,
      accountId: 'acc-1',
      categoryId: 'cat-1',
    };

    await transactionsApi.create(input);

    expect(api.post).toHaveBeenCalledWith('/transactions', input);
  });

  it('update llama PATCH /transactions/:id con el body', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { id: 'tx-1' } });

    await transactionsApi.update('tx-1', { amount: 80 });

    expect(api.patch).toHaveBeenCalledWith('/transactions/tx-1', { amount: 80 });
  });

  it('delete llama DELETE /transactions/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: undefined });

    await transactionsApi.delete('tx-1');

    expect(api.delete).toHaveBeenCalledWith('/transactions/tx-1');
  });

  it('getReceiptItems llama GET /transactions/:id/items', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    await transactionsApi.getReceiptItems('tx-1');

    expect(api.get).toHaveBeenCalledWith('/transactions/tx-1/items');
  });

  it('getSummary llama GET /transactions/summary con los filtros', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    await transactionsApi.getSummary({ type: 'income' });

    expect(api.get).toHaveBeenCalledWith('/transactions/summary', { params: { type: 'income' } });
  });
});
