import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategorySelect } from './category-select';
import type { Category } from '../../types';

const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Comida',
    type: 'expense',
    icon: 'Utensils',
    color: null,
    userId: 'u1',
    createdAt: '2024-01-01',
  },
  {
    id: 'cat-2',
    name: 'Transporte',
    type: 'expense',
    icon: 'Car',
    color: null,
    userId: 'u1',
    createdAt: '2024-01-01',
  },
];

describe('CategorySelect', () => {
  it('sin valor muestra el placeholder', () => {
    render(<CategorySelect categories={categories} value="" onChange={vi.fn()} />);
    expect(screen.getByText('Seleccionar categoría')).toBeInTheDocument();
  });

  it('con valor muestra el nombre de la categoría seleccionada', () => {
    render(<CategorySelect categories={categories} value="cat-1" onChange={vi.fn()} />);
    expect(screen.getByText('Comida')).toBeInTheDocument();
  });

  it('click en el trigger abre la lista de categorías', async () => {
    const user = userEvent.setup();
    render(<CategorySelect categories={categories} value="" onChange={vi.fn()} />);

    await user.click(screen.getByText('Seleccionar categoría'));

    expect(screen.getByText('Transporte')).toBeInTheDocument();
  });

  it('elegir una categoría llama onChange y cierra la lista', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<CategorySelect categories={categories} value="" onChange={onChange} />);

    await user.click(screen.getByText('Seleccionar categoría'));
    await user.click(screen.getByText('Transporte'));

    expect(onChange).toHaveBeenCalledWith('cat-2');
  });

  it('sin categorías muestra el mensaje vacío al abrir', async () => {
    const user = userEvent.setup();
    render(<CategorySelect categories={[]} value="" onChange={vi.fn()} />);

    await user.click(screen.getByText('Seleccionar categoría'));

    expect(screen.getByText('No hay categorías')).toBeInTheDocument();
  });

  it('click afuera cierra la lista', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <CategorySelect categories={categories} value="" onChange={vi.fn()} />
        <button>afuera</button>
      </div>
    );

    await user.click(screen.getByText('Seleccionar categoría'));
    expect(screen.getByText('Transporte')).toBeInTheDocument();

    await user.click(screen.getByText('afuera'));

    expect(screen.queryByText('Transporte')).not.toBeInTheDocument();
  });
});
