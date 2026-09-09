import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createQueryClientWrapper } from '../../../test-utils/query-client';
import type { FormEvent } from 'react';
import { useTransactionsPage } from './useTransactionsPage';

const { mockToastError, mockApiCreate, mockApiDelete, mockReload } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
  mockApiCreate: vi.fn(),
  mockApiDelete: vi.fn(),
  mockReload: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: mockToastError },
}));

vi.mock('../api', () => ({
  transactionsApi: {
    create: mockApiCreate,
    update: vi.fn(),
    delete: mockApiDelete,
    getReceiptItems: vi.fn(),
  },
}));

vi.mock('../../../lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('./useTransactions', () => ({
  useTransactions: vi.fn(() => ({
    transactions: [],
    total: 0,
    loading: false,
    reload: mockReload,
    error: null,
  })),
}));

vi.mock('./useTransactionFilters', () => ({
  useTransactionFilters: vi.fn(() => ({
    filters: {
      startDate: '',
      endDate: '',
      accountId: 'all',
      type: 'all',
      categoryIds: [],
      minAmount: '',
      maxAmount: '',
    },
    hasActiveFilters: false,
    setStartDate: vi.fn(),
    setEndDate: vi.fn(),
    toggleCategory: vi.fn(),
    removeCategory: vi.fn(),
    setAccountId: vi.fn(),
    setMinAmount: vi.fn(),
    setMaxAmount: vi.fn(),
    setType: vi.fn(),
    clearFilters: vi.fn(),
  })),
}));

vi.mock('./useTransactionSummary', () => ({
  useTransactionSummary: vi.fn(() => ({ summary: [], loading: false })),
}));

vi.mock('../../../hooks/usePagination', () => ({
  usePagination: vi.fn(() => ({
    currentPage: 1,
    nextPage: vi.fn(),
    previousPage: vi.fn(),
    resetPage: vi.fn(),
    getPaginationInfo: vi.fn(() => ({
      startItem: 0,
      endItem: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    })),
  })),
}));

vi.mock('../../accounts/hooks/useAccounts', () => ({
  useAccounts: vi.fn(() => ({ accounts: [], loading: false, error: null, reload: vi.fn() })),
}));

vi.mock('../../categories/hooks/useCategories', () => ({
  useCategories: vi.fn(() => ({ categories: [], loading: false, error: null, reload: vi.fn() })),
}));

const { mockGetClosedPeriodWarning } = vi.hoisted(() => ({
  mockGetClosedPeriodWarning: vi.fn(
    () => null as null | { type: 'error' | 'warning'; message: string }
  ),
}));

vi.mock('../../../lib/credit-card-utils', () => ({
  getClosedPeriodWarning: mockGetClosedPeriodWarning,
}));

import { useAccounts } from '../../accounts/hooks/useAccounts';
import { useCategories } from '../../categories/hooks/useCategories';

const fakeEvent = { preventDefault: vi.fn() } as unknown as FormEvent;

describe('useTransactionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiCreate.mockResolvedValue({});
    mockApiDelete.mockResolvedValue({});
  });

  it('handleSubmit exitoso llama reload y cierra el formulario', async () => {
    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(mockApiCreate).toHaveBeenCalledOnce();
    expect(result.current.showForm).toBe(false);
  });

  it('handleSubmit con error llama toast.error con el mensaje real del backend y no hace reload', async () => {
    mockApiCreate.mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(mockToastError).toHaveBeenCalledWith('API error');
  });

  it('handleDelete exitoso llama reload y limpia deleteId', async () => {
    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.setDeleteId('tx-123');
    });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockApiDelete).toHaveBeenCalledWith('tx-123');
    expect(result.current.deleteId).toBeNull();
  });

  it('handleOpenForm resetea el formulario con la primera cuenta y categoría expense por defecto', () => {
    vi.mocked(useAccounts).mockReturnValue({
      accounts: [{ id: 'acc-1' }, { id: 'acc-2' }] as never,
      loading: false,
      error: null,
      reload: vi.fn(),
    });
    vi.mocked(useCategories).mockReturnValue({
      categories: [
        { id: 'cat-income', type: 'income' },
        { id: 'cat-expense', type: 'expense' },
      ] as never,
      loading: false,
      error: null,
      reload: vi.fn(),
    });

    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.handleOpenForm();
    });

    expect(result.current.showForm).toBe(true);
    expect(result.current.formData.accountId).toBe('acc-1');
    expect(result.current.formData.categoryId).toBe('cat-expense');
  });

  it('handleCloseForm cierra el formulario y lo resetea', () => {
    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.handleOpenForm();
    });
    act(() => {
      result.current.handleFormDataChange({ amount: '99' });
    });
    act(() => {
      result.current.handleCloseForm();
    });

    expect(result.current.showForm).toBe(false);
    expect(result.current.formData.amount).toBe('');
  });

  it('handleTypeChange cambia el tipo y selecciona la categoría default de ese tipo', () => {
    vi.mocked(useCategories).mockReturnValue({
      categories: [
        { id: 'cat-income', type: 'income' },
        { id: 'cat-expense', type: 'expense' },
      ] as never,
      loading: false,
      error: null,
      reload: vi.fn(),
    });

    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.handleTypeChange('income');
    });

    expect(result.current.formData.type).toBe('income');
    expect(result.current.formData.categoryId).toBe('cat-income');
  });

  it('filteredCategories solo incluye categorías del tipo actual del formulario', () => {
    vi.mocked(useCategories).mockReturnValue({
      categories: [
        { id: 'cat-income', type: 'income' },
        { id: 'cat-expense', type: 'expense' },
      ] as never,
      loading: false,
      error: null,
      reload: vi.fn(),
    });

    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.filteredCategories).toEqual([{ id: 'cat-expense', type: 'expense' }]);
  });

  it('dateWarning es null si no hay accountId, fecha o el tipo no es expense', () => {
    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.dateWarning).toBeNull();
    expect(mockGetClosedPeriodWarning).not.toHaveBeenCalled();
  });

  it('dateWarning delega en getClosedPeriodWarning cuando hay cuenta, fecha y tipo expense', () => {
    const account = { id: 'acc-1' };
    vi.mocked(useAccounts).mockReturnValue({
      accounts: [account] as never,
      loading: false,
      error: null,
      reload: vi.fn(),
    });
    // getClosedPeriodWarning real solo puede devolver { type: 'error', ... } o null
    // (ver src/lib/credit-card-utils.ts) — se usa ese valor real, no uno que la
    // función jamás produce, para no dar falsa confianza sobre una rama muerta.
    mockGetClosedPeriodWarning.mockReturnValue({
      type: 'error',
      message: 'período ya cerrado',
    });

    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.handleFormDataChange({ accountId: 'acc-1', date: '2026-01-01' });
    });

    expect(mockGetClosedPeriodWarning).toHaveBeenCalledWith('2026-01-01', account);
    expect(result.current.dateWarning).toEqual({ type: 'error', message: 'período ya cerrado' });
  });

  it('handleScannedReceipt precarga el formulario con los datos del OCR y abre el modal', () => {
    vi.mocked(useCategories).mockReturnValue({
      categories: [{ id: 'cat-comida', type: 'expense', name: 'Comida' }] as never,
      loading: false,
      error: null,
      reload: vi.fn(),
    });
    vi.mocked(useAccounts).mockReturnValue({
      accounts: [{ id: 'acc-1' }] as never,
      loading: false,
      error: null,
      reload: vi.fn(),
    });

    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.handleScannedReceipt({
        amount: 42.5,
        description: 'Super',
        date: '2026-02-01',
        suggestedCategory: 'comida',
        imageHash: 'hash-1',
        items: [],
      } as never);
    });

    expect(result.current.showForm).toBe(true);
    expect(result.current.formData).toMatchObject({
      amount: '42.5',
      description: 'Super',
      categoryId: 'cat-comida',
      accountId: 'acc-1',
      imageHash: 'hash-1',
    });
  });

  it('handleScannedReceipt sin categoría sugerida que matchee conserva la categoría actual', () => {
    vi.mocked(useCategories).mockReturnValue({
      categories: [{ id: 'cat-comida', type: 'expense', name: 'Comida' }] as never,
      loading: false,
      error: null,
      reload: vi.fn(),
    });

    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.handleScannedReceipt({
        amount: 10,
        description: 'x',
        date: '2026-02-01',
        suggestedCategory: 'no-existe',
        imageHash: 'hash-1',
      } as never);
    });

    expect(result.current.formData.categoryId).toBe('');
  });

  it('handleEdit setea la transacción en edición', () => {
    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });
    const tx = { id: 'tx-1' } as never;

    act(() => {
      result.current.handleEdit(tx);
    });

    expect(result.current.editingTransaction).toBe(tx);
  });

  it('handleSaveEdit exitoso limpia editingTransaction', async () => {
    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.handleEdit({ id: 'tx-1' } as never);
    });

    await act(async () => {
      await result.current.handleSaveEdit('tx-1', {
        description: 'nueva',
        categoryId: 'cat-1',
        date: '2026-01-01',
        amount: '10',
      });
    });

    expect(result.current.editingTransaction).toBeNull();
  });

  it('handleSaveEdit con error muestra el mensaje real y no limpia editingTransaction', async () => {
    const { transactionsApi } = await import('../api');
    vi.mocked(transactionsApi.update).mockRejectedValueOnce(new Error('update failed'));
    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.handleEdit({ id: 'tx-1' } as never);
    });

    await act(async () => {
      await result.current.handleSaveEdit('tx-1', {
        description: 'x',
        categoryId: 'cat-1',
        date: '2026-01-01',
        amount: '10',
      });
    });

    expect(mockToastError).toHaveBeenCalledWith('update failed');
    expect(result.current.editingTransaction).not.toBeNull();
  });

  it('handleDelete sin deleteId no llama a la API', async () => {
    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockApiDelete).not.toHaveBeenCalled();
  });

  it('handleViewItems con items ya cargados no vuelve a pedirlos a la API', async () => {
    const { transactionsApi } = await import('../api');
    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });
    const tx = { id: 'tx-1', receiptItems: [{ id: 'item-1' }] } as never;

    await act(async () => {
      await result.current.handleViewItems(tx);
    });

    expect(result.current.viewingItems).toBe(tx);
    expect(transactionsApi.getReceiptItems).not.toHaveBeenCalled();
  });

  it('handleViewItems sin items los pide a la API y los agrega a la transacción', async () => {
    const { transactionsApi } = await import('../api');
    vi.mocked(transactionsApi.getReceiptItems).mockResolvedValueOnce([{ id: 'item-1' }] as never);
    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });
    const tx = { id: 'tx-1', receiptItems: [] } as never;

    await act(async () => {
      await result.current.handleViewItems(tx);
    });

    expect(result.current.viewingItems).toEqual({ ...tx, receiptItems: [{ id: 'item-1' }] });
    expect(result.current.loadingItemsId).toBeNull();
  });

  it('handleViewItems con error en la API muestra el toast y limpia loadingItemsId', async () => {
    const { transactionsApi } = await import('../api');
    vi.mocked(transactionsApi.getReceiptItems).mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useTransactionsPage(), {
      wrapper: createQueryClientWrapper(),
    });
    const tx = { id: 'tx-1', receiptItems: [] } as never;

    await act(async () => {
      await result.current.handleViewItems(tx);
    });

    expect(mockToastError).toHaveBeenCalledWith('No se pudieron cargar los ítems del recibo');
    expect(result.current.loadingItemsId).toBeNull();
  });
});
