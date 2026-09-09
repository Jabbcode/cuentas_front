import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../api', () => ({
  categoriesApi: { getSpending: vi.fn().mockResolvedValue({}) },
}));

import { CategoryList } from './CategoryList';
import type { Category } from '../../../types';

const makeCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 'cat-1',
  name: 'Comida',
  type: 'expense',
  icon: 'utensils',
  color: '#f00',
  ...overrides,
});

describe('CategoryList', () => {
  it('sin items: muestra el estado vacío', () => {
    render(<CategoryList items={[]} title="Gastos" onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Sin categorías')).toBeInTheDocument();
  });

  it('renderiza el título y el nombre de cada categoría', () => {
    render(
      <CategoryList
        items={[
          makeCategory({ id: 'cat-1', name: 'Comida' }),
          makeCategory({ id: 'cat-2', name: 'Ocio' }),
        ]}
        title="Gastos"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Gastos')).toBeInTheDocument();
    expect(screen.getByText('Comida')).toBeInTheDocument();
    expect(screen.getByText('Ocio')).toBeInTheDocument();
  });

  it('click en editar llama a onEdit con la categoría', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const category = makeCategory();
    render(<CategoryList items={[category]} title="Gastos" onEdit={onEdit} onDelete={vi.fn()} />);

    // El componente renderiza dos copias (desktop/mobile, alternadas por CSS) con
    // el mismo aria-label y el mismo handler — cualquiera de las dos es correcta.
    const editButtons = screen.getAllByRole('button', { name: `Editar ${category.name}` });
    await user.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledWith(category);
  });

  it('click en eliminar llama a onDelete con el id', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const category = makeCategory({ id: 'cat-9' });
    render(<CategoryList items={[category]} title="Gastos" onEdit={vi.fn()} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: `Eliminar ${category.name}` });
    await user.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith('cat-9');
  });
});
