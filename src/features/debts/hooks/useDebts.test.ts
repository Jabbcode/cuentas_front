import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDebts } from './useDebts';
import type { Debt } from '../../../types';

const { mockToastError } = vi.hoisted(() => ({ mockToastError: vi.fn() }));

vi.mock('../api', () => ({
  debtsApi: { getAll: vi.fn(), delete: vi.fn(), pay: vi.fn() },
}));

vi.mock('../../../lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: mockToastError },
}));

import { debtsApi } from '../api';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useDebts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga las deudas, pasando el status como parte de la query', async () => {
    vi.mocked(debtsApi.getAll).mockResolvedValue([{ id: 'd1' }] as unknown as Debt[]);

    const { result } = renderHook(() => useDebts('active'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(debtsApi.getAll).toHaveBeenCalledWith('active');
    expect(result.current.debts).toEqual([{ id: 'd1' }]);
  });

  it('error al cargar: toast + mensaje traducido', async () => {
    vi.mocked(debtsApi.getAll).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useDebts(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Error al cargar las deudas. Intenta de nuevo.');
    expect(mockToastError).toHaveBeenCalledWith('No se pudieron cargar las deudas');
  });

  it('deleteDebt: llama a la API con el id', async () => {
    vi.mocked(debtsApi.getAll).mockResolvedValue([]);
    vi.mocked(debtsApi.delete).mockResolvedValue(undefined as never);
    const { result } = renderHook(() => useDebts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteDebt('d1');
    });

    expect(debtsApi.delete).toHaveBeenCalledWith('d1');
  });

  it('payDebt: llama a la API con monto, cuenta y notas', async () => {
    vi.mocked(debtsApi.getAll).mockResolvedValue([]);
    vi.mocked(debtsApi.pay).mockResolvedValue(undefined as never);
    const { result } = renderHook(() => useDebts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.payDebt('d1', 100, 'account-1', 'nota');
    });

    expect(debtsApi.pay).toHaveBeenCalledWith('d1', {
      amount: 100,
      accountId: 'account-1',
      notes: 'nota',
    });
  });
});
