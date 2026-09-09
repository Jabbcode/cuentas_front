import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createQueryClientWrapper } from '../../../test-utils/query-client';
import { useFixedExpensesPage } from './useFixedExpensesPage';

const { mockToastError, mockDeleteExpense } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
  mockDeleteExpense: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: mockToastError },
}));

vi.mock('../../../lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('./useFixedExpenses', () => ({
  useFixedExpenses: vi.fn(() => ({
    summary: null,
    loading: false,
    error: null,
    reload: vi.fn(),
    payExpense: vi.fn(),
    deleteExpense: mockDeleteExpense,
    toggleActive: vi.fn(),
  })),
}));

vi.mock('../utils', () => ({
  getExpenseCategories: vi.fn(() => []),
  getIncomeCategories: vi.fn(() => []),
  getFilteredExpenseItems: vi.fn(() => []),
  getFilteredIncomeItems: vi.fn(() => []),
  getCreditCardItems: vi.fn(() => []),
  getDebtPaymentItems: vi.fn(() => []),
  sumActiveAmounts: vi.fn(() => 0),
  toggleCategorySelection: vi.fn((prev: string[], id: string) =>
    prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
  ),
}));

describe('useFixedExpensesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('openCreateForm abre el form sin id en edición', () => {
    const { result } = renderHook(() => useFixedExpensesPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => result.current.openEditForm('fe-1'));
    expect(result.current.editingId).toBe('fe-1');
    expect(result.current.showForm).toBe(false);

    act(() => result.current.openCreateForm());
    expect(result.current.showForm).toBe(true);
    expect(result.current.editingId).toBeNull();
  });

  it('closeForm limpia showForm y editingId', () => {
    const { result } = renderHook(() => useFixedExpensesPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => result.current.openEditForm('fe-1'));
    act(() => result.current.closeForm());

    expect(result.current.showForm).toBe(false);
    expect(result.current.editingId).toBeNull();
  });

  it('requestDelete / cancelDelete manejan deleteId sin llamar a la API', () => {
    const { result } = renderHook(() => useFixedExpensesPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => result.current.requestDelete('fe-1'));
    expect(result.current.deleteId).toBe('fe-1');

    act(() => result.current.cancelDelete());
    expect(result.current.deleteId).toBeNull();
    expect(mockDeleteExpense).not.toHaveBeenCalled();
  });

  it('handleDelete: elimina el gasto pedido y limpia deleteId', async () => {
    mockDeleteExpense.mockResolvedValue(undefined);
    const { result } = renderHook(() => useFixedExpensesPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => result.current.requestDelete('fe-1'));
    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockDeleteExpense).toHaveBeenCalledWith('fe-1');
    expect(result.current.deleteId).toBeNull();
    expect(result.current.deleting).toBe(false);
  });

  it('handleDelete con error: muestra toast y no deja deleting=true', async () => {
    mockDeleteExpense.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useFixedExpensesPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => result.current.requestDelete('fe-1'));
    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockToastError).toHaveBeenCalledWith('No se pudo eliminar el gasto fijo');
    expect(result.current.deleting).toBe(false);
  });

  it('toggleExpenseCategory / toggleIncomeCategory operan listas independientes', () => {
    const { result } = renderHook(() => useFixedExpensesPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => result.current.toggleExpenseCategory('cat-1'));
    expect(result.current.selectedExpenseCategories).toEqual(['cat-1']);
    expect(result.current.selectedIncomeCategories).toEqual([]);

    act(() => result.current.toggleIncomeCategory('cat-2'));
    expect(result.current.selectedIncomeCategories).toEqual(['cat-2']);
  });

  it('clearExpenseFilters / clearIncomeFilters vacían sus listas', () => {
    const { result } = renderHook(() => useFixedExpensesPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => result.current.toggleExpenseCategory('cat-1'));
    act(() => result.current.toggleIncomeCategory('cat-2'));

    act(() => result.current.clearExpenseFilters());
    act(() => result.current.clearIncomeFilters());

    expect(result.current.selectedExpenseCategories).toEqual([]);
    expect(result.current.selectedIncomeCategories).toEqual([]);
  });
});
