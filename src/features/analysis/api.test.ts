import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/client', () => ({
  api: { get: vi.fn() },
}));

import { api } from '../../api/client';
import { analysisApi } from './api';

describe('analysisApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCategoryMonthlySeries llama GET /transactions/category-series con los filtros como params', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { months: [], series: [] } });

    await analysisApi.getCategoryMonthlySeries({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      type: 'expense',
      accountId: 'all',
    });

    expect(api.get).toHaveBeenCalledWith('/transactions/category-series', {
      params: { startDate: '2026-01-01', endDate: '2026-01-31', type: 'expense' },
    });
  });

  it('omite accountId de los params cuando vale "all"', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { months: [], series: [] } });

    await analysisApi.getCategoryMonthlySeries({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      type: 'expense',
      accountId: 'all',
    });

    const [, options] = vi.mocked(api.get).mock.calls[0];
    expect(options?.params).not.toHaveProperty('accountId');
  });

  it('incluye accountId en los params cuando hay una cuenta específica', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { months: [], series: [] } });

    await analysisApi.getCategoryMonthlySeries({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      type: 'expense',
      accountId: 'acc-1',
    });

    expect(api.get).toHaveBeenCalledWith('/transactions/category-series', {
      params: {
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        type: 'expense',
        accountId: 'acc-1',
      },
    });
  });

  it('devuelve el body de la respuesta tal cual', async () => {
    const body = { months: ['2026-01'], series: [] };
    vi.mocked(api.get).mockResolvedValue({ data: body });

    const result = await analysisApi.getCategoryMonthlySeries({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      type: 'expense',
      accountId: 'all',
    });

    expect(result).toEqual(body);
  });
});
