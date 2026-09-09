import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/client', () => ({
  api: { get: vi.fn() },
}));

import { api } from '../../api/client';
import { dashboardApi } from './api';

describe('dashboardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getSummary: GET /dashboard/summary', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} });
    await dashboardApi.getSummary();
    expect(api.get).toHaveBeenCalledWith('/dashboard/summary');
  });

  it('getByCategory: usa "expense" por defecto', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    await dashboardApi.getByCategory();
    expect(api.get).toHaveBeenCalledWith('/dashboard/by-category', { params: { type: 'expense' } });
  });

  it('getByCategory: respeta el type pasado', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    await dashboardApi.getByCategory('income');
    expect(api.get).toHaveBeenCalledWith('/dashboard/by-category', { params: { type: 'income' } });
  });

  it('getMonthlyTrend: usa 6 meses por defecto', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    await dashboardApi.getMonthlyTrend();
    expect(api.get).toHaveBeenCalledWith('/dashboard/monthly-trend', { params: { months: 6 } });
  });

  it('getMonthlyTrend: respeta el número de meses pasado', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    await dashboardApi.getMonthlyTrend(3);
    expect(api.get).toHaveBeenCalledWith('/dashboard/monthly-trend', { params: { months: 3 } });
  });

  it('getFixedVsVariable: GET /dashboard/fixed-vs-variable', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} });
    await dashboardApi.getFixedVsVariable();
    expect(api.get).toHaveBeenCalledWith('/dashboard/fixed-vs-variable');
  });

  it('getNextMonthProjection: GET /dashboard/next-month-projection', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} });
    await dashboardApi.getNextMonthProjection();
    expect(api.get).toHaveBeenCalledWith('/dashboard/next-month-projection');
  });

  it('getMonthlySummary: pasa month/year como params', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} });
    await dashboardApi.getMonthlySummary(6, 2026);
    expect(api.get).toHaveBeenCalledWith('/dashboard/monthly-summary', {
      params: { month: 6, year: 2026 },
    });
  });
});
