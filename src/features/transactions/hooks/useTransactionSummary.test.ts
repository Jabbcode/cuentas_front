import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryClientWrapper } from '../../../test-utils/query-client';
import { useTransactionSummary } from './useTransactionSummary';

vi.mock('../api', () => ({
  transactionsApi: { getSummary: vi.fn() },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { transactionsApi } from '../api';

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

    const { result } = renderHook(() => useTransactionSummary({}), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.summary).toEqual(summary);
  });

  it('deja summary vacío si la query está deshabilitada', async () => {
    const { result } = renderHook(() => useTransactionSummary({}, false), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.summary).toEqual([]);
    expect(transactionsApi.getSummary).not.toHaveBeenCalled();
  });

  it('reload dispara un refetch', async () => {
    vi.mocked(transactionsApi.getSummary).mockResolvedValue([]);

    const { result } = renderHook(() => useTransactionSummary({}), {
      wrapper: createQueryClientWrapper(),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    result.current.reload();

    await waitFor(() => expect(transactionsApi.getSummary).toHaveBeenCalledTimes(2));
  });
});
