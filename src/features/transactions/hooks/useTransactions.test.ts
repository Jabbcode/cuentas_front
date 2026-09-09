import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryClientWrapper } from '../../../test-utils/query-client';
import { useTransactions } from './useTransactions';
import type { Transaction } from '../../../types';

vi.mock('../api', () => ({
  transactionsApi: { getAll: vi.fn() },
}));

vi.mock('../../../lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { transactionsApi } from '../api';

const baseParams = { currentPage: 1, itemsPerPage: 20 };

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga transacciones y total en éxito', async () => {
    const tx = [{ id: 'tx-1' } as unknown as Transaction];
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: tx,
      total: 1,
      limit: 20,
      offset: 0,
    });

    const { result } = renderHook(() => useTransactions(baseParams), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.transactions).toEqual(tx);
    expect(result.current.total).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('setea error y deja transactions vacío si la API falla', async () => {
    vi.mocked(transactionsApi.getAll).mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useTransactions(baseParams), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Error al cargar las transacciones. Intenta de nuevo.');
    expect(result.current.transactions).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('reload dispara un refetch', async () => {
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: [],
      total: 0,
      limit: 20,
      offset: 0,
    });

    const { result } = renderHook(() => useTransactions(baseParams), {
      wrapper: createQueryClientWrapper(),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    result.current.reload();

    await waitFor(() => expect(transactionsApi.getAll).toHaveBeenCalledTimes(2));
  });
});
