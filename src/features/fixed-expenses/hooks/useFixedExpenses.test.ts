import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useFixedExpenses } from './useFixedExpenses';
import type { FixedExpenseSummary } from '../../../types';

const { mockToastError } = vi.hoisted(() => ({ mockToastError: vi.fn() }));

vi.mock('../api', () => ({
  fixedExpensesApi: {
    getSummary: vi.fn(),
    pay: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../../lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: mockToastError },
}));

import { fixedExpensesApi } from '../api';

const fakeSummary = { items: [], totalMonthlyExpenses: 0 } as unknown as FixedExpenseSummary;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useFixedExpenses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fixedExpensesApi.getSummary).mockResolvedValue(fakeSummary);
  });

  it('carga el resumen y expone loading/error', async () => {
    const { result } = renderHook(() => useFixedExpenses(), { wrapper: createWrapper() });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.summary).toEqual(fakeSummary);
    expect(result.current.error).toBeNull();
  });

  it('error al cargar: muestra toast y expone un mensaje traducido', async () => {
    vi.mocked(fixedExpensesApi.getSummary).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useFixedExpenses(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Error al cargar los gastos fijos. Intenta de nuevo.');
    expect(mockToastError).toHaveBeenCalledWith('No se pudieron cargar los gastos fijos');
  });

  it('payExpense: llama a la API con el monto y refresca el resumen', async () => {
    vi.mocked(fixedExpensesApi.pay).mockResolvedValue(undefined as never);
    const { result } = renderHook(() => useFixedExpenses(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.payExpense('fe-1', 50);
    });

    expect(fixedExpensesApi.pay).toHaveBeenCalledWith('fe-1', { amount: 50 });
  });

  it('payExpense sin monto: llama a la API sin body', async () => {
    vi.mocked(fixedExpensesApi.pay).mockResolvedValue(undefined as never);
    const { result } = renderHook(() => useFixedExpenses(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.payExpense('fe-1');
    });

    expect(fixedExpensesApi.pay).toHaveBeenCalledWith('fe-1', undefined);
  });

  it('payExpense con error: no lanza, muestra toast con el mensaje del error', async () => {
    vi.mocked(fixedExpensesApi.pay).mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useFixedExpenses(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.payExpense('fe-1', 50);
    });

    expect(mockToastError).toHaveBeenCalledWith('fail');
  });

  it('toggleActive: invierte isActive al llamar a update', async () => {
    vi.mocked(fixedExpensesApi.update).mockResolvedValue(undefined as never);
    const { result } = renderHook(() => useFixedExpenses(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleActive('fe-1', true);
    });

    expect(fixedExpensesApi.update).toHaveBeenCalledWith('fe-1', { isActive: false });
  });

  it('deleteExpense: llama a delete', async () => {
    vi.mocked(fixedExpensesApi.delete).mockResolvedValue(undefined as never);
    const { result } = renderHook(() => useFixedExpenses(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteExpense('fe-1');
    });

    expect(fixedExpensesApi.delete).toHaveBeenCalledWith('fe-1');
  });
});
