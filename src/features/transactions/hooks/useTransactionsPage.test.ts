import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { FormEvent } from 'react';
import { useTransactionsPage } from './useTransactionsPage';

const {
  mockToastError,
  mockApiCreate,
  mockApiDelete,
  mockReload,
  mockReloadTags,
  mockReloadTagSummary,
} = vi.hoisted(() => ({
  mockToastError: vi.fn(),
  mockApiCreate: vi.fn(),
  mockApiDelete: vi.fn(),
  mockReload: vi.fn(),
  mockReloadTags: vi.fn(),
  mockReloadTagSummary: vi.fn(),
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
      tag: '',
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
    setTag: vi.fn(),
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

vi.mock('../../../hooks/useTags', () => ({
  useTags: vi.fn(() => ({ tags: [], reload: mockReloadTags })),
  useTagsSummary: vi.fn(() => ({ summary: [], loading: false, reload: mockReloadTagSummary })),
}));

vi.mock('../../../lib/credit-card-utils', () => ({
  getClosedPeriodWarning: vi.fn(() => null),
}));

const fakeEvent = { preventDefault: vi.fn() } as unknown as FormEvent;

describe('useTransactionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiCreate.mockResolvedValue({});
    mockApiDelete.mockResolvedValue({});
  });

  it('handleSubmit exitoso llama reload y cierra el formulario', async () => {
    const { result } = renderHook(() => useTransactionsPage());

    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(mockApiCreate).toHaveBeenCalledOnce();
    expect(mockReload).toHaveBeenCalled();
    expect(result.current.showForm).toBe(false);
  });

  it('handleSubmit con error llama toast.error y no hace reload', async () => {
    mockApiCreate.mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useTransactionsPage());

    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(mockToastError).toHaveBeenCalledWith('No se pudo guardar la transacción');
    expect(mockReload).not.toHaveBeenCalled();
  });

  it('handleDelete exitoso llama reload y limpia deleteId', async () => {
    const { result } = renderHook(() => useTransactionsPage());

    act(() => {
      result.current.setDeleteId('tx-123');
    });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockApiDelete).toHaveBeenCalledWith('tx-123');
    expect(mockReload).toHaveBeenCalled();
    expect(result.current.deleteId).toBeNull();
  });
});
