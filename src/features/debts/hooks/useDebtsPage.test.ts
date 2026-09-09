import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDebtsPage } from './useDebtsPage';
import type { Debt } from '../../../types';

const {
  mockToastError,
  mockDeleteDebt,
  mockPayDebt,
  mockDeleteRecurringPayment,
  mockReloadRecurring,
} = vi.hoisted(() => ({
  mockToastError: vi.fn(),
  mockDeleteDebt: vi.fn(),
  mockPayDebt: vi.fn(),
  mockDeleteRecurringPayment: vi.fn(),
  mockReloadRecurring: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: mockToastError },
}));

vi.mock('../../../lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('./useDebts', () => ({
  useDebts: vi.fn(() => ({
    debts: [],
    loading: false,
    error: null,
    reload: vi.fn(),
    deleteDebt: mockDeleteDebt,
    payDebt: mockPayDebt,
  })),
}));

vi.mock('./useRecurringDebtPayments', () => ({
  useRecurringDebtPayments: vi.fn(() => ({
    recurringPayments: [],
    reload: mockReloadRecurring,
    deleteRecurringPayment: mockDeleteRecurringPayment,
    toggleActive: vi.fn(),
  })),
}));

function fakeDebt(overrides: Partial<Debt> = {}): Debt {
  return { id: 'debt-1', status: 'active', remainingAmount: 100, ...overrides } as unknown as Debt;
}

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useDebtsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handleOpenCreate abre el form sin deuda en edición; handleCloseForm lo cierra', () => {
    const { result } = renderHook(() => useDebtsPage(), { wrapper: createWrapper() });

    act(() => result.current.handleEditDebt(fakeDebt()));
    expect(result.current.showForm).toBe(true);
    expect(result.current.editingDebt).toEqual(fakeDebt());

    act(() => result.current.handleOpenCreate());
    expect(result.current.editingDebt).toBeUndefined();
    expect(result.current.showForm).toBe(true);

    act(() => result.current.handleCloseForm());
    expect(result.current.showForm).toBe(false);
    expect(result.current.editingDebt).toBeUndefined();
  });

  it('handlePay: sin payingDebt seteado, no llama a payDebt', async () => {
    const { result } = renderHook(() => useDebtsPage(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.handlePay(50, 'account-1');
    });

    expect(mockPayDebt).not.toHaveBeenCalled();
  });

  it('handlePay: con payingDebt seteado, paga esa deuda', async () => {
    mockPayDebt.mockResolvedValue(undefined);
    const { result } = renderHook(() => useDebtsPage(), { wrapper: createWrapper() });

    act(() => result.current.handleSetPayingDebt(fakeDebt({ id: 'debt-2' })));
    await act(async () => {
      await result.current.handlePay(50, 'account-1', 'nota');
    });

    expect(mockPayDebt).toHaveBeenCalledWith('debt-2', 50, 'account-1', 'nota');
  });

  it('handlePay con error: muestra toast, no rompe', async () => {
    mockPayDebt.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useDebtsPage(), { wrapper: createWrapper() });

    act(() => result.current.handleSetPayingDebt(fakeDebt()));
    await act(async () => {
      await result.current.handlePay(50, 'account-1');
    });

    expect(mockToastError).toHaveBeenCalledWith('boom');
  });

  it('handleConfirmDelete: sin deleteId no hace nada', async () => {
    const { result } = renderHook(() => useDebtsPage(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(mockDeleteDebt).not.toHaveBeenCalled();
  });

  it('handleConfirmDelete: elimina la deuda pedida y limpia deleteId', async () => {
    mockDeleteDebt.mockResolvedValue(undefined);
    const { result } = renderHook(() => useDebtsPage(), { wrapper: createWrapper() });

    act(() => result.current.handleRequestDelete('debt-1'));
    expect(result.current.deleteId).toBe('debt-1');

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(mockDeleteDebt).toHaveBeenCalledWith('debt-1');
    expect(result.current.deleteId).toBeNull();
    expect(result.current.deleting).toBe(false);
  });

  it('handleConfirmDelete con error: mantiene deleting=false y muestra toast', async () => {
    mockDeleteDebt.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useDebtsPage(), { wrapper: createWrapper() });

    act(() => result.current.handleRequestDelete('debt-1'));
    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(mockToastError).toHaveBeenCalledWith('No se pudo eliminar la deuda');
    expect(result.current.deleting).toBe(false);
  });

  it('handleCancelDelete: limpia deleteId sin llamar a deleteDebt', () => {
    const { result } = renderHook(() => useDebtsPage(), { wrapper: createWrapper() });

    act(() => result.current.handleRequestDelete('debt-1'));
    act(() => result.current.handleCancelDelete());

    expect(result.current.deleteId).toBeNull();
    expect(mockDeleteDebt).not.toHaveBeenCalled();
  });

  it('handleConfirmDeleteRecurring: elimina el pago recurrente pedido', async () => {
    mockDeleteRecurringPayment.mockResolvedValue(undefined);
    const { result } = renderHook(() => useDebtsPage(), { wrapper: createWrapper() });

    act(() => result.current.handleRequestDeleteRecurring('rp-1'));
    await act(async () => {
      await result.current.handleConfirmDeleteRecurring();
    });

    expect(mockDeleteRecurringPayment).toHaveBeenCalledWith('rp-1');
    expect(result.current.deleteRecurringId).toBeNull();
  });

  it('handleRecurringSuccess: cierra el modal y recarga los pagos recurrentes', () => {
    const { result } = renderHook(() => useDebtsPage(), { wrapper: createWrapper() });

    act(() => result.current.handleOpenRecurring(fakeDebt()));
    expect(result.current.configuringRecurring).toEqual(fakeDebt());

    act(() => result.current.handleRecurringSuccess());

    expect(result.current.configuringRecurring).toBeUndefined();
    expect(result.current.editingRecurring).toBeUndefined();
    expect(mockReloadRecurring).toHaveBeenCalled();
  });

  it('handleViewHistory / handleCloseHistory alternan viewingHistory', () => {
    const { result } = renderHook(() => useDebtsPage(), { wrapper: createWrapper() });

    act(() => result.current.handleViewHistory(fakeDebt()));
    expect(result.current.viewingHistory).toEqual(fakeDebt());

    act(() => result.current.handleCloseHistory());
    expect(result.current.viewingHistory).toBeUndefined();
  });
});
