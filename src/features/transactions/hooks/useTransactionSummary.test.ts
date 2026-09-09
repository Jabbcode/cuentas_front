import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useTransactionSummary } from './useTransactionSummary';

vi.mock('../api', () => ({
  transactionsApi: { getSummary: vi.fn() },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { transactionsApi } from '../api';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useTransactionSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga el resumen en éxito', async () => {
    const summary = [
      {
        category: { id: 'c1', name: 'Comida', icon: null, color: null },
        expenseTotal: 10,
        incomeTotal: 0,
        count: 1,
        netTotal: -10,
      },
    ];
    vi.mocked(transactionsApi.getSummary).mockResolvedValue(summary);

    const { result } = renderHook(() => useTransactionSummary({}), { wrapper: createWrapper() });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.summary).toEqual(summary);
  });

  it('deja summary vacío si la query está deshabilitada', async () => {
    const { result } = renderHook(() => useTransactionSummary({}, false), {
      wrapper: createWrapper(),
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.summary).toEqual([]);
    expect(transactionsApi.getSummary).not.toHaveBeenCalled();
  });

  it('reload dispara un refetch', async () => {
    vi.mocked(transactionsApi.getSummary).mockResolvedValue([]);

    const { result } = renderHook(() => useTransactionSummary({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    result.current.reload();

    await waitFor(() => expect(transactionsApi.getSummary).toHaveBeenCalledTimes(2));
  });
});
