import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCreditCardsPage } from './useCreditCardsPage';
import type { CreditCardStatement } from '../../../types';

const { mockToastError, mockPayStatement, mockTxCreate } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
  mockPayStatement: vi.fn(),
  mockTxCreate: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: mockToastError },
}));

vi.mock('../../../lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('../api', () => ({
  creditCardsApi: { payStatement: mockPayStatement },
}));

vi.mock('../../transactions', () => ({
  transactionsApi: { create: mockTxCreate },
}));

vi.mock('../utils', () => ({
  getTodayDateString: vi.fn(() => '2026-06-15'),
}));

function fakeStatement(overrides: Partial<CreditCardStatement> = {}): CreditCardStatement {
  return {
    account: { id: 'card-1', name: 'Visa' },
    closedPeriod: { balance: 300 },
    currentPeriod: { balance: 50 },
    ...overrides,
  } as unknown as CreditCardStatement;
}

const mockUseCreditCards = vi.fn();
vi.mock('./useCreditCards', () => ({
  useCreditCards: () => mockUseCreditCards(),
}));

vi.mock('../../categories/hooks/useCategories', () => ({
  useCategories: vi.fn(() => ({
    categories: [
      { id: 'cat-1', name: 'Comida', type: 'expense' },
      { id: 'cat-2', name: 'Salario', type: 'income' },
    ],
    loading: false,
    error: null,
    reload: vi.fn(),
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useCreditCardsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCreditCards.mockReturnValue({
      statements: [fakeStatement()],
      accounts: [{ id: 'acc-1', name: 'Cuenta' }],
      loading: false,
      error: null,
      reload: vi.fn(),
    });
  });

  it('filtra expenseCategories solo con type=expense', () => {
    const { result } = renderHook(() => useCreditCardsPage(), { wrapper: createWrapper() });

    expect(result.current.expenseCategories.map((c) => c.id)).toEqual(['cat-1']);
  });

  it('handleOpenPayment: precarga el monto con el balance del período cerrado', () => {
    const { result } = renderHook(() => useCreditCardsPage(), { wrapper: createWrapper() });

    act(() => result.current.handleOpenPayment(fakeStatement()));

    expect(result.current.paymentModal.open).toBe(true);
    expect(result.current.paymentFormData.amount).toBe('300');
    expect(result.current.paymentFormData.paymentAccountId).toBe('acc-1');
  });

  it('handleClosePayment: cierra el modal y resetea el form', () => {
    const { result } = renderHook(() => useCreditCardsPage(), { wrapper: createWrapper() });

    act(() => result.current.handleOpenPayment(fakeStatement()));
    act(() => result.current.handleClosePayment());

    expect(result.current.paymentModal.open).toBe(false);
    expect(result.current.paymentFormData.amount).toBe('');
  });

  it('toggleCardCollapse: alterna solo la tarjeta indicada', () => {
    const { result } = renderHook(() => useCreditCardsPage(), { wrapper: createWrapper() });

    act(() => result.current.toggleCardCollapse('card-1'));
    expect(result.current.collapsedCards.has('card-1')).toBe(false);

    act(() => result.current.toggleCardCollapse('card-1'));
    expect(result.current.collapsedCards.has('card-1')).toBe(true);
  });

  it('handlePay: sin statement en el modal, no llama a la API', async () => {
    const { result } = renderHook(() => useCreditCardsPage(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.handlePay({ preventDefault: vi.fn() } as never);
    });

    expect(mockPayStatement).not.toHaveBeenCalled();
  });

  it('handlePay: paga la tarjeta del modal y lo cierra', async () => {
    mockPayStatement.mockResolvedValue(undefined);
    const { result } = renderHook(() => useCreditCardsPage(), { wrapper: createWrapper() });

    act(() => result.current.handleOpenPayment(fakeStatement()));
    await act(async () => {
      await result.current.handlePay({ preventDefault: vi.fn() } as never);
    });

    expect(mockPayStatement).toHaveBeenCalledWith(
      'card-1',
      expect.objectContaining({ amount: 300 })
    );
    expect(result.current.paymentModal.open).toBe(false);
  });

  it('handlePay con error: muestra toast, no rompe', async () => {
    mockPayStatement.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useCreditCardsPage(), { wrapper: createWrapper() });

    act(() => result.current.handleOpenPayment(fakeStatement()));
    await act(async () => {
      await result.current.handlePay({ preventDefault: vi.fn() } as never);
    });

    expect(mockToastError).toHaveBeenCalledWith('No se pudo registrar el pago de la tarjeta');
  });

  it('handleSubmitExpense: sin statement en el modal, no llama a la API', async () => {
    const { result } = renderHook(() => useCreditCardsPage(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.handleSubmitExpense({ preventDefault: vi.fn() } as never);
    });

    expect(mockTxCreate).not.toHaveBeenCalled();
  });

  it('handleSubmitExpense: crea el gasto contra la cuenta de la tarjeta del modal', async () => {
    mockTxCreate.mockResolvedValue(undefined);
    const { result } = renderHook(() => useCreditCardsPage(), { wrapper: createWrapper() });

    act(() => result.current.handleOpenExpense(fakeStatement()));
    act(() => result.current.handleExpenseFormChange({ amount: '25', categoryId: 'cat-1' }));
    await act(async () => {
      await result.current.handleSubmitExpense({ preventDefault: vi.fn() } as never);
    });

    expect(mockTxCreate).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: 'card-1', amount: 25, categoryId: 'cat-1' })
    );
    expect(result.current.expenseModal.open).toBe(false);
  });
});
