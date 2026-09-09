import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCategoriesPage } from './useCategoriesPage';
import type { Category } from '../../../types';

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
  categoriesApi: { create: mockApiCreate, update: mockApiUpdate, delete: mockApiDelete },
}));

vi.mock('./useCategories', () => ({
  useCategories: vi.fn(() => ({
    categories: [
      { id: 'c1', name: 'Comida', type: 'expense' },
      { id: 'c2', name: 'Salario', type: 'income' },
    ],
    loading: false,
    error: null,
    reload: vi.fn(),
  })),
}));

function fakeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'c3',
    name: 'Ocio',
    type: 'expense',
    icon: null,
    color: null,
    ...overrides,
  } as unknown as Category;
}

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useCategoriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('separa categorías de expense e income', () => {
    const { result } = renderHook(() => useCategoriesPage(), { wrapper: createWrapper() });

    expect(result.current.expenseCategories.map((c) => c.id)).toEqual(['c1']);
    expect(result.current.incomeCategories.map((c) => c.id)).toEqual(['c2']);
  });

  it('openForm con categoría: precarga el form y limpia el error previo', () => {
    const { result } = renderHook(() => useCategoriesPage(), { wrapper: createWrapper() });

    act(() => result.current.openForm(fakeCategory({ name: 'Transporte' })));

    expect(result.current.editingCategory?.name).toBe('Transporte');
    expect(result.current.formData.name).toBe('Transporte');
    expect(result.current.error).toBe('');
  });

  it('handleSubmit sin editingCategory: crea la categoría', async () => {
    mockApiCreate.mockResolvedValue(fakeCategory());
    const { result } = renderHook(() => useCategoriesPage(), { wrapper: createWrapper() });
    act(() => result.current.openForm());

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as never);
    });

    expect(mockApiCreate).toHaveBeenCalled();
    expect(result.current.showForm).toBe(false);
  });

  it('handleSubmit con editingCategory: actualiza', async () => {
    mockApiUpdate.mockResolvedValue(fakeCategory());
    const { result } = renderHook(() => useCategoriesPage(), { wrapper: createWrapper() });
    act(() => result.current.openForm(fakeCategory({ id: 'c9' })));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as never);
    });

    expect(mockApiUpdate).toHaveBeenCalledWith('c9', expect.any(Object));
  });

  it('handleSubmit con error: muestra toast, no rompe', async () => {
    mockApiCreate.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useCategoriesPage(), { wrapper: createWrapper() });
    act(() => result.current.openForm());

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as never);
    });

    expect(mockToastError).toHaveBeenCalledWith('No se pudo guardar la categoría');
  });

  it('handleDelete: error genérico limpia deleteId sin setear el mensaje de "transacciones"', async () => {
    mockApiDelete.mockRejectedValue(new Error('otro error'));
    const { result } = renderHook(() => useCategoriesPage(), { wrapper: createWrapper() });

    act(() => result.current.setDeleteId('c1'));
    await act(async () => {
      await result.current.handleDelete();
    });

    expect(result.current.deleteId).toBeNull();
    expect(result.current.error).toBe('');
  });

  it('handleDelete: error con "transacciones" en el mensaje setea el error explicativo', async () => {
    mockApiDelete.mockRejectedValue(new Error('Tiene transacciones asociadas'));
    const { result } = renderHook(() => useCategoriesPage(), { wrapper: createWrapper() });

    act(() => result.current.setDeleteId('c1'));
    await act(async () => {
      await result.current.handleDelete();
    });

    expect(result.current.error).toBe(
      'No se puede eliminar una categoría con transacciones asociadas'
    );
  });

  it('handleDelete exitoso: elimina y limpia deleteId', async () => {
    mockApiDelete.mockResolvedValue(undefined);
    const { result } = renderHook(() => useCategoriesPage(), { wrapper: createWrapper() });

    act(() => result.current.setDeleteId('c1'));
    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockApiDelete).toHaveBeenCalledWith('c1');
    expect(result.current.deleteId).toBeNull();
  });
});
