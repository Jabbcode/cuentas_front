import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createQueryClientWrapper } from '../../../test-utils/query-client';
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
  OVERDUE_MONTHS_DEFAULT: 6,
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
  useCreditCards: (months: number) => mockUseCreditCards(months),
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
    const { result } = renderHook(() => useCreditCardsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.expenseCategories.map((c) => c.id)).toEqual(['cat-1']);
  });

  it('handleOpenPayment: precarga el monto con el balance del período cerrado', () => {
    const { result } = renderHook(() => useCreditCardsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => result.current.handleOpenPayment(fakeStatement()));

    expect(result.current.paymentModal.open).toBe(true);
    expect(result.current.paymentFormData.amount).toBe('300');
    expect(result.current.paymentFormData.paymentAccountId).toBe('acc-1');
  });

  it('handleClosePayment: cierra el modal y resetea el form', () => {
    const { result } = renderHook(() => useCreditCardsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => result.current.handleOpenPayment(fakeStatement()));
    act(() => result.current.handleClosePayment());

    expect(result.current.paymentModal.open).toBe(false);
    expect(result.current.paymentFormData.amount).toBe('');
  });

  it('toggleCardCollapse: alterna solo la tarjeta indicada', () => {
    const { result } = renderHook(() => useCreditCardsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => result.current.toggleCardCollapse('card-1'));
    expect(result.current.collapsedCards.has('card-1')).toBe(false);

    act(() => result.current.toggleCardCollapse('card-1'));
    expect(result.current.collapsedCards.has('card-1')).toBe(true);
  });

  it('handlePay: sin statement en el modal, no llama a la API', async () => {
    const { result } = renderHook(() => useCreditCardsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    await act(async () => {
      await result.current.handlePay({ preventDefault: vi.fn() } as never);
    });

    expect(mockPayStatement).not.toHaveBeenCalled();
  });

  it('handlePay: paga la tarjeta del modal y lo cierra', async () => {
    mockPayStatement.mockResolvedValue(undefined);
    const { result } = renderHook(() => useCreditCardsPage(), {
      wrapper: createQueryClientWrapper(),
    });

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
    const { result } = renderHook(() => useCreditCardsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => result.current.handleOpenPayment(fakeStatement()));
    await act(async () => {
      await result.current.handlePay({ preventDefault: vi.fn() } as never);
    });

    // getApiErrorMessage expone err.message cuando es un Error de JS (mismo patrón que handleSubmitExpense)
    expect(mockToastError).toHaveBeenCalledWith('boom');
  });

  it('handleSubmitExpense: sin statement en el modal, no llama a la API', async () => {
    const { result } = renderHook(() => useCreditCardsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    await act(async () => {
      await result.current.handleSubmitExpense({ preventDefault: vi.fn() } as never);
    });

    expect(mockTxCreate).not.toHaveBeenCalled();
  });

  it('handleSubmitExpense: crea el gasto contra la cuenta de la tarjeta del modal', async () => {
    mockTxCreate.mockResolvedValue(undefined);
    const { result } = renderHook(() => useCreditCardsPage(), {
      wrapper: createQueryClientWrapper(),
    });

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

  describe('pago de período atrasado', () => {
    it('handleOpenOverduePayment: precarga el monto completo del período y el target overdue', () => {
      const { result } = renderHook(() => useCreditCardsPage(), {
        wrapper: createQueryClientWrapper(),
      });

      act(() =>
        // startDate simula lo que devuelve un servidor en huso horario adelantado a UTC
        // (p. ej. Europe/Madrid): el 5-feb local se serializa como "2026-02-04T23:...Z".
        // periodKey, en cambio, siempre trae el día calendario correcto ("2026-02-05")
        // porque nunca pasa por una conversión UTC — es lo que debe usarse, no startDate.
        result.current.handleOpenOverduePayment(fakeStatement(), {
          startDate: '2026-02-04T23:00:00.000Z',
          endDate: '2026-03-03T23:00:00.000Z',
          periodKey: '2026-02-05',
          balance: 75,
          transactionCount: 2,
          paymentDueDate: '2026-03-20T00:00:00.000Z',
          daysOverdue: 10,
        })
      );

      expect(result.current.paymentModal.open).toBe(true);
      expect(result.current.paymentModal.target).toEqual({
        kind: 'overdue',
        periodStart: '2026-02-05',
        endDate: '2026-03-03T23:00:00.000Z',
        amount: 75,
      });
      expect(result.current.paymentFormData.amount).toBe('75');
    });

    it('handlePay con target overdue: llama a payStatement con periodStart', async () => {
      mockPayStatement.mockResolvedValue(undefined);
      const { result } = renderHook(() => useCreditCardsPage(), {
        wrapper: createQueryClientWrapper(),
      });

      act(() =>
        // Mismo escenario de desfase de huso horario que el test anterior.
        result.current.handleOpenOverduePayment(fakeStatement(), {
          startDate: '2026-02-04T23:00:00.000Z',
          endDate: '2026-03-03T23:00:00.000Z',
          periodKey: '2026-02-05',
          balance: 75,
          transactionCount: 2,
          paymentDueDate: '2026-03-20T00:00:00.000Z',
          daysOverdue: 10,
        })
      );
      await act(async () => {
        await result.current.handlePay({ preventDefault: vi.fn() } as never);
      });

      // periodStart debe llegar como el periodKey correcto ("2026-02-05"), no como
      // "2026-02-04" (lo que daría slice(startDate,0,10)) — regresión del bug de huso
      // horario detectado en la revisión de seguridad/funcional.
      expect(mockPayStatement).toHaveBeenCalledWith(
        'card-1',
        expect.objectContaining({ amount: 75, periodStart: '2026-02-05' })
      );
      expect(result.current.paymentModal.open).toBe(false);
    });

    it('handlePay con target closed: periodStart va undefined', async () => {
      mockPayStatement.mockResolvedValue(undefined);
      const { result } = renderHook(() => useCreditCardsPage(), {
        wrapper: createQueryClientWrapper(),
      });

      act(() => result.current.handleOpenPayment(fakeStatement()));
      await act(async () => {
        await result.current.handlePay({ preventDefault: vi.fn() } as never);
      });

      expect(mockPayStatement).toHaveBeenCalledWith(
        'card-1',
        expect.objectContaining({ periodStart: undefined })
      );
    });

    it('handlePay con error en un atrasado: muestra toast y el modal no se cierra', async () => {
      mockPayStatement.mockRejectedValue(new Error('ya pagado'));
      const { result } = renderHook(() => useCreditCardsPage(), {
        wrapper: createQueryClientWrapper(),
      });

      act(() =>
        result.current.handleOpenOverduePayment(fakeStatement(), {
          startDate: '2026-02-05',
          endDate: '2026-03-04',
          periodKey: '2026-02-05',
          balance: 75,
          transactionCount: 2,
          paymentDueDate: '2026-03-20',
          daysOverdue: 10,
        })
      );
      await act(async () => {
        await result.current.handlePay({ preventDefault: vi.fn() } as never);
      });

      expect(mockToastError).toHaveBeenCalledWith('ya pagado');
      expect(result.current.paymentModal.open).toBe(true);
    });
  });

  describe('overdueMonths', () => {
    it('default en 6, pasado a useCreditCards', () => {
      const { result } = renderHook(() => useCreditCardsPage(), {
        wrapper: createQueryClientWrapper(),
      });

      expect(result.current.overdueMonths).toBe(6);
      expect(mockUseCreditCards).toHaveBeenCalledWith(6);
    });

    it('setOverdueMonths(12): actualiza el estado y vuelve a llamar a useCreditCards con 12', () => {
      const { result } = renderHook(() => useCreditCardsPage(), {
        wrapper: createQueryClientWrapper(),
      });

      act(() => result.current.setOverdueMonths(12));

      expect(result.current.overdueMonths).toBe(12);
      expect(mockUseCreditCards).toHaveBeenCalledWith(12);
    });

    it('no persiste: remontar el hook vuelve a 6', () => {
      const { result, unmount } = renderHook(() => useCreditCardsPage(), {
        wrapper: createQueryClientWrapper(),
      });
      act(() => result.current.setOverdueMonths(12));
      expect(result.current.overdueMonths).toBe(12);
      unmount();

      const { result: result2 } = renderHook(() => useCreditCardsPage(), {
        wrapper: createQueryClientWrapper(),
      });

      expect(result2.current.overdueMonths).toBe(6);
    });
  });
});
