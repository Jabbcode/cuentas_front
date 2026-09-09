import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryFilter } from './CategoryFilter';

const categories = [
  { id: 'cat-1', name: 'Alimentación', icon: null, color: null },
  { id: 'cat-2', name: 'Transporte', icon: null, color: null },
];

describe('CategoryFilter', () => {
  it('sin categorías: no renderiza nada', () => {
    const { container } = render(
      <CategoryFilter categories={[]} selected={[]} onToggle={vi.fn()} onClear={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('sin selección: no muestra el botón Limpiar', () => {
    render(
      <CategoryFilter categories={categories} selected={[]} onToggle={vi.fn()} onClear={vi.fn()} />
    );
    expect(screen.queryByRole('button', { name: 'Limpiar' })).not.toBeInTheDocument();
  });

  it('click en una categoría dispara onToggle con su id', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <CategoryFilter categories={categories} selected={[]} onToggle={onToggle} onClear={vi.fn()} />
    );

    await user.click(screen.getByText('Transporte'));

    expect(onToggle).toHaveBeenCalledWith('cat-2');
  });

  it('con selección: muestra Limpiar y dispara onClear', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <CategoryFilter
        categories={categories}
        selected={['cat-1']}
        onToggle={vi.fn()}
        onClear={onClear}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
