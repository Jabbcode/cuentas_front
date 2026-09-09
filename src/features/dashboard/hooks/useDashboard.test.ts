import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDashboard } from './useDashboard';
import type { DashboardSummary, FixedExpenseSummary, ProjectionData } from '../../../types';

vi.mock('../api', () => ({
  dashboardApi: { getSummary: vi.fn(), getMonthlyTrend: vi.fn(), getNextMonthProjection: vi.fn() },
}));

vi.mock('../../fixed-expenses', () => ({
  fixedExpensesApi: { getSummary: vi.fn() },
}));

vi.mock('../../credit-cards/api', () => ({
  creditCardsApi: { getSummary: vi.fn() },
}));

vi.mock('../../debts/api', () => ({
  debtsApi: { getSummary: vi.fn() },
}));

import { dashboardApi } from '../api';
import { fixedExpensesApi } from '../../fixed-expenses';
import { creditCardsApi } from '../../credit-cards/api';
import { debtsApi } from '../../debts/api';

const fakeSummary = { totalBalance: 100 } as unknown as DashboardSummary;
const fakeFixedSummary = { totalMonthlyExpenses: 50 } as unknown as FixedExpenseSummary;
const fakeProjection = { netProjection: 10 } as unknown as ProjectionData;

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dashboardApi.getSummary).mockResolvedValue(fakeSummary);
    vi.mocked(dashboardApi.getMonthlyTrend).mockResolvedValue([]);
    vi.mocked(dashboardApi.getNextMonthProjection).mockResolvedValue(fakeProjection);
    vi.mocked(fixedExpensesApi.getSummary).mockResolvedValue(fakeFixedSummary);
  });

  it('combina summary, fixedSummary, projection, creditCards y debts en un solo objeto', async () => {
    vi.mocked(creditCardsApi.getSummary).mockResolvedValue({
      totalToPay: 5,
    } as never);
    vi.mocked(debtsApi.getSummary).mockResolvedValue({ totalActiveDebts: 2 } as never);

    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.summary).toEqual(fakeSummary);
    expect(result.current.fixedSummary).toEqual(fakeFixedSummary);
    expect(result.current.projection).toEqual(fakeProjection);
    expect(result.current.creditCardsSummary).toEqual({ totalToPay: 5 });
    expect(result.current.debtsSummary).toEqual({ totalActiveDebts: 2 });
  });

  it('si creditCardsApi.getSummary falla, usa un resumen vacío en su lugar (no rompe el dashboard)', async () => {
    vi.mocked(creditCardsApi.getSummary).mockRejectedValue(new Error('boom'));
    vi.mocked(debtsApi.getSummary).mockResolvedValue({ totalActiveDebts: 0 } as never);

    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.creditCardsSummary).toEqual({
      totalToPay: 0,
      upcomingPayments: [],
      alerts: [],
      cards: [],
    });
  });

  it('si debtsApi.getSummary falla, usa un resumen vacío en su lugar', async () => {
    vi.mocked(creditCardsApi.getSummary).mockResolvedValue({ totalToPay: 0 } as never);
    vi.mocked(debtsApi.getSummary).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.debtsSummary).toEqual({
      totalActiveDebts: 0,
      totalOverdueDebts: 0,
      totalDebtAmount: 0,
      totalOverdueAmount: 0,
      debtsDueSoon: 0,
      upcomingDebts: [],
    });
  });

  it('monthlyTrend y trendLoading vienen de una query separada de getMonthlyTrend(6)', async () => {
    vi.mocked(dashboardApi.getMonthlyTrend).mockResolvedValue([{ month: 'ene' }] as never);
    vi.mocked(creditCardsApi.getSummary).mockResolvedValue({ totalToPay: 0 } as never);
    vi.mocked(debtsApi.getSummary).mockResolvedValue({ totalActiveDebts: 0 } as never);

    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.trendLoading).toBe(false));

    expect(dashboardApi.getMonthlyTrend).toHaveBeenCalledWith(6);
    expect(result.current.monthlyTrend).toEqual([{ month: 'ene' }]);
  });
});
