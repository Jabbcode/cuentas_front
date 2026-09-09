import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryClientWrapper } from '../../../test-utils/query-client';
import { useCategories } from './useCategories';
import type { Category } from '../../../types';

vi.mock('../api', () => ({
  categoriesApi: { getAll: vi.fn() },
}));

vi.mock('../../../lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { categoriesApi } from '../api';

const makeCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 'cat-1',
  name: 'Comida',
  type: 'expense',
  icon: 'utensils',
  color: '#f00',
  ...overrides,
});

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga categorías y pone loading=false al terminar', async () => {
    const categories = [makeCategory()];
    vi.mocked(categoriesApi.getAll).mockResolvedValue(categories);

    const { result } = renderHook(() => useCategories(), { wrapper: createQueryClientWrapper() });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toEqual(categories);
    expect(result.current.error).toBeNull();
  });

  it('setea error y deja categories vacío si la API falla', async () => {
    vi.mocked(categoriesApi.getAll).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCategories(), { wrapper: createQueryClientWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Error al cargar las categorías. Intenta de nuevo.');
    expect(result.current.categories).toEqual([]);
  });

  it('reload dispara un refetch', async () => {
    vi.mocked(categoriesApi.getAll).mockResolvedValue([]);
    const { result } = renderHook(() => useCategories(), { wrapper: createQueryClientWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    result.current.reload();

    await waitFor(() => expect(categoriesApi.getAll).toHaveBeenCalledTimes(2));
  });
});
