import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { UseCategoriesPageReturn } from '../features/categories/types';

const mockUseCategoriesPage = vi.fn();
vi.mock('../features/categories/hooks/useCategoriesPage', () => ({
  useCategoriesPage: () => mockUseCategoriesPage(),
}));

import { CategoriesPage } from './CategoriesPage';

function baseReturn(overrides: Partial<UseCategoriesPageReturn> = {}): UseCategoriesPageReturn {
  return {
    categories: [],
    expenseCategories: [],
    incomeCategories: [],
    loading: false,
    saving: false,
    deleting: false,
    showForm: false,
    editingCategory: null,
    deleteId: null,
    error: '',
    formData: { name: '', type: 'expense', icon: '', color: '', monthlyLimit: '' },
    openForm: vi.fn(),
    closeForm: vi.fn(),
    setFormData: vi.fn(),
    handleSubmit: vi.fn(),
    handleDelete: vi.fn(),
    setDeleteId: vi.fn(),
    reload: vi.fn(),
    loadError: null,
    ...overrides,
  };
}

describe('CategoriesPage', () => {
  it('loading: muestra el spinner', () => {
    mockUseCategoriesPage.mockReturnValue(baseReturn({ loading: true }));
    render(<CategoriesPage />);

    expect(screen.queryByText('Categorías')).not.toBeInTheDocument();
  });

  it('loadError: muestra el ErrorCard con retry', () => {
    mockUseCategoriesPage.mockReturnValue(baseReturn({ loadError: 'Fallo de red' }));
    render(<CategoriesPage />);

    expect(screen.getByText('Fallo de red')).toBeInTheDocument();
  });

  it('con datos: muestra las listas de gastos e ingresos', () => {
    mockUseCategoriesPage.mockReturnValue(
      baseReturn({
        expenseCategories: [{ id: 'cat-1', name: 'Comida', type: 'expense' }],
        incomeCategories: [{ id: 'cat-2', name: 'Salario', type: 'income' }],
      })
    );
    render(<CategoriesPage />);

    expect(screen.getByText('Categorías')).toBeInTheDocument();
    expect(screen.getByText('Comida')).toBeInTheDocument();
    expect(screen.getByText('Salario')).toBeInTheDocument();
  });
});
