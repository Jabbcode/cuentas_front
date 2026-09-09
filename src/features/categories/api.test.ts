import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/client', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import { api } from '../../api/client';
import { categoriesApi } from './api';

describe('categoriesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll sin type: GET /categories sin params', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [{ id: 'cat-1' }] });

    const result = await categoriesApi.getAll();

    expect(api.get).toHaveBeenCalledWith('/categories', { params: {} });
    expect(result).toEqual([{ id: 'cat-1' }]);
  });

  it('getAll con type: agrega el filtro en params', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    await categoriesApi.getAll('income');

    expect(api.get).toHaveBeenCalledWith('/categories', { params: { type: 'income' } });
  });

  it('getById: GET /categories/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { id: 'cat-1' } });

    await categoriesApi.getById('cat-1');

    expect(api.get).toHaveBeenCalledWith('/categories/cat-1');
  });

  it('create: POST /categories con el payload', async () => {
    const payload = {
      name: 'Comida',
      type: 'expense' as const,
      icon: 'x',
      color: '#fff',
      monthlyLimit: null,
    };
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'cat-1', ...payload } });

    await categoriesApi.create(payload);

    expect(api.post).toHaveBeenCalledWith('/categories', payload);
  });

  it('update: PATCH /categories/:id con los cambios parciales', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: {} });

    await categoriesApi.update('cat-1', { name: 'Nuevo nombre' });

    expect(api.patch).toHaveBeenCalledWith('/categories/cat-1', { name: 'Nuevo nombre' });
  });

  it('delete: DELETE /categories/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({});

    await categoriesApi.delete('cat-1');

    expect(api.delete).toHaveBeenCalledWith('/categories/cat-1');
  });

  it('getSpending: GET /categories/:id/spending', async () => {
    const spending = {
      categoryId: 'cat-1',
      categoryName: 'Comida',
      spent: 10,
      limit: 100,
      remaining: 90,
      percentage: 10,
      isOverLimit: false,
    };
    vi.mocked(api.get).mockResolvedValue({ data: spending });

    const result = await categoriesApi.getSpending('cat-1');

    expect(api.get).toHaveBeenCalledWith('/categories/cat-1/spending');
    expect(result).toEqual(spending);
  });
});
