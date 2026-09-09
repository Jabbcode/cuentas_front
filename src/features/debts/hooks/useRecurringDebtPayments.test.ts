import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { createQueryClientWrapper } from '../../../test-utils/query-client';
import { useRecurringDebtPayments } from './useRecurringDebtPayments';
import type { RecurringDebtPayment } from '../../../types';

vi.mock('../api', () => ({
  recurringDebtPaymentsApi: { getAll: vi.fn(), delete: vi.fn(), update: vi.fn() },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { recurringDebtPaymentsApi } from '../api';

describe('useRecurringDebtPayments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga los pagos recurrentes filtrando por debtId', async () => {
    vi.mocked(recurringDebtPaymentsApi.getAll).mockResolvedValue([
      { id: 'rp-1' },
    ] as unknown as RecurringDebtPayment[]);

    const { result } = renderHook(() => useRecurringDebtPayments('debt-1'), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(recurringDebtPaymentsApi.getAll).toHaveBeenCalledWith('debt-1');
    expect(result.current.recurringPayments).toEqual([{ id: 'rp-1' }]);
  });

  it('deleteRecurringPayment: llama a la API con el id', async () => {
    vi.mocked(recurringDebtPaymentsApi.getAll).mockResolvedValue([]);
    vi.mocked(recurringDebtPaymentsApi.delete).mockResolvedValue(undefined as never);
    const { result } = renderHook(() => useRecurringDebtPayments(), {
      wrapper: createQueryClientWrapper(),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteRecurringPayment('rp-1');
    });

    expect(recurringDebtPaymentsApi.delete).toHaveBeenCalledWith('rp-1');
  });

  it('toggleActive: llama a update con el nuevo valor de isActive', async () => {
    vi.mocked(recurringDebtPaymentsApi.getAll).mockResolvedValue([]);
    vi.mocked(recurringDebtPaymentsApi.update).mockResolvedValue(undefined as never);
    const { result } = renderHook(() => useRecurringDebtPayments(), {
      wrapper: createQueryClientWrapper(),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleActive('rp-1', false);
    });

    expect(recurringDebtPaymentsApi.update).toHaveBeenCalledWith('rp-1', { isActive: false });
  });
});
