import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { createQueryClientWrapper } from '../../../test-utils/query-client';
import { useAccountsPage } from './useAccountsPage';
import type { CreditCardsSummary } from '../../../types';
import { fakeAccount } from '../../../test-utils/fixtures';

const { mockToastError, mockApiCreate, mockApiUpdate, mockApiDelete } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
  mockApiCreate: vi.fn(),
  mockApiUpdate: vi.fn(),
  mockApiDelete: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: mockToastError },
}));

vi.mock('../../../lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('../api', () => ({
  accountsApi: {
    getAll: vi.fn(),
    create: mockApiCreate,
    update: mockApiUpdate,
    delete: mockApiDelete,
  },
}));

vi.mock('./useAccounts', () => ({
  useAccounts: vi.fn(() => ({
    accounts: [
      { id: 'acc-1', name: 'BBVA', type: 'bank', balance: 100, currency: 'EUR' },
      { id: 'card-1', name: 'Visa', type: 'credit_card', balance: -50, currency: 'EUR' },
    ],
    loading: false,
    error: null,
    reload: vi.fn(),
  })),
}));

describe('useAccountsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('openForm sin cuenta: resetea a los defaults y abre el form', () => {
    const { result } = renderHook(() => useAccountsPage(), { wrapper: createQueryClientWrapper() });

    act(() => result.current.openForm());

    expect(result.current.showForm).toBe(true);
    expect(result.current.editingAccount).toBeNull();
    expect(result.current.formData).toMatchObject({ name: '', type: 'bank', balance: '0' });
  });

  it('openForm con cuenta: precarga el formulario con sus datos', () => {
    const { result } = renderHook(() => useAccountsPage(), { wrapper: createQueryClientWrapper() });

    act(() => result.current.openForm(fakeAccount({ name: 'Ahorros', balance: 350 })));

    expect(result.current.editingAccount?.name).toBe('Ahorros');
    expect(result.current.formData.name).toBe('Ahorros');
    expect(result.current.formData.balance).toBe('350');
  });

  it('closeForm: cierra el form y limpia editingAccount', () => {
    const { result } = renderHook(() => useAccountsPage(), { wrapper: createQueryClientWrapper() });

    act(() => result.current.openForm(fakeAccount()));
    act(() => result.current.closeForm());

    expect(result.current.showForm).toBe(false);
    expect(result.current.editingAccount).toBeNull();
  });

  it('handleSubmit sin editingAccount: crea la cuenta y cierra el form', async () => {
    mockApiCreate.mockResolvedValue(fakeAccount());
    const { result } = renderHook(() => useAccountsPage(), { wrapper: createQueryClientWrapper() });
    act(() => result.current.openForm());
    act(() => result.current.setFormData((prev) => ({ ...prev, name: 'Nueva cuenta' })));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as never);
    });

    expect(mockApiCreate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Nueva cuenta' }));
    expect(result.current.showForm).toBe(false);
  });

  it('handleSubmit con editingAccount: actualiza la cuenta existente', async () => {
    mockApiUpdate.mockResolvedValue(fakeAccount());
    const { result } = renderHook(() => useAccountsPage(), { wrapper: createQueryClientWrapper() });
    act(() => result.current.openForm(fakeAccount({ id: 'acc-9' })));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as never);
    });

    expect(mockApiUpdate).toHaveBeenCalledWith('acc-9', expect.any(Object));
    expect(mockApiCreate).not.toHaveBeenCalled();
  });

  it('handleSubmit con error: muestra toast y mantiene saving=false', async () => {
    mockApiCreate.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useAccountsPage(), { wrapper: createQueryClientWrapper() });
    act(() => result.current.openForm());

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as never);
    });

    expect(mockToastError).toHaveBeenCalledWith('No se pudo guardar la cuenta');
    expect(result.current.saving).toBe(false);
  });

  it('handleDelete sin deleteId: no llama a la API', async () => {
    const { result } = renderHook(() => useAccountsPage(), { wrapper: createQueryClientWrapper() });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockApiDelete).not.toHaveBeenCalled();
  });

  it('handleDelete con deleteId: elimina y limpia el id', async () => {
    mockApiDelete.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAccountsPage(), { wrapper: createQueryClientWrapper() });

    act(() => result.current.setDeleteId('acc-1'));
    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockApiDelete).toHaveBeenCalledWith('acc-1');
    expect(result.current.deleteId).toBeNull();
  });

  it('toggleSection: invierte solo la sección indicada', () => {
    const { result } = renderHook(() => useAccountsPage(), { wrapper: createQueryClientWrapper() });

    expect(result.current.expandedSections.bank).toBe(true);
    act(() => result.current.toggleSection('bank'));
    expect(result.current.expandedSections.bank).toBe(false);
    expect(result.current.expandedSections.cash).toBe(true);
  });

  it('agrupa las cuentas por tipo y calcula el balance total', () => {
    const { result } = renderHook(() => useAccountsPage(), { wrapper: createQueryClientWrapper() });

    expect(result.current.groupedAccounts.bank).toHaveLength(1);
    expect(result.current.groupedAccounts.credit_card).toHaveLength(1);
  });

  it('con fetchSummary y cuentas con tarjeta: carga el statementsMap', async () => {
    const fetchSummary = vi.fn().mockResolvedValue({
      cards: [{ account: { id: 'card-1' }, closedPeriod: {}, currentPeriod: {} }],
    } as unknown as CreditCardsSummary);

    const { result } = renderHook(() => useAccountsPage({ fetchSummary }), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.statementsMap['card-1']).toBeDefined());
  });
});
