import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryMultiSelect } from './CategoryMultiSelect';
import type { CategorySeries } from '../types';

function series(ids: string[]): CategorySeries[] {
  return ids.map((id) => ({
    category: { id, name: id, icon: null, color: null },
    total: 0,
    points: [],
  }));
}

describe('CategoryMultiSelect', () => {
  it('con menos de 8 seleccionadas, ningún checkbox no-marcado está disabled', () => {
    const ids = ['a', 'b', 'c'];
    render(
      <CategoryMultiSelect
        series={series(ids)}
        selectedCategoryIds={['a']}
        isSelectionFull={false}
        onToggleCategory={vi.fn()}
      />
    );

    expect(screen.getByLabelText('b')).not.toBeDisabled();
    expect(screen.getByLabelText('c')).not.toBeDisabled();
  });

  it('con 8 seleccionadas, el checkbox de una 9ª (no marcada) está disabled y el motivo es visible', () => {
    const ids = Array.from({ length: 9 }, (_, i) => `cat-${i}`);
    const selected = ids.slice(0, 8);
    render(
      <CategoryMultiSelect
        series={series(ids)}
        selectedCategoryIds={selected}
        isSelectionFull
        onToggleCategory={vi.fn()}
      />
    );

    expect(screen.getByLabelText('cat-8')).toBeDisabled();
    expect(screen.getByText(/Ya hay 8 categorías seleccionadas/)).toBeInTheDocument();
  });

  it('al desmarcar una, la 9ª deja de estar disabled', () => {
    const ids = Array.from({ length: 9 }, (_, i) => `cat-${i}`);
    const { rerender } = render(
      <CategoryMultiSelect
        series={series(ids)}
        selectedCategoryIds={ids.slice(0, 8)}
        isSelectionFull
        onToggleCategory={vi.fn()}
      />
    );
    expect(screen.getByLabelText('cat-8')).toBeDisabled();

    rerender(
      <CategoryMultiSelect
        series={series(ids)}
        selectedCategoryIds={ids.slice(1, 8)} // se desmarcó 'cat-0'
        isSelectionFull={false}
        onToggleCategory={vi.fn()}
      />
    );

    expect(screen.getByLabelText('cat-8')).not.toBeDisabled();
  });

  it('las categorías ya seleccionadas nunca quedan disabled, aunque isSelectionFull sea true', () => {
    const ids = Array.from({ length: 8 }, (_, i) => `cat-${i}`);
    render(
      <CategoryMultiSelect
        series={series(ids)}
        selectedCategoryIds={ids}
        isSelectionFull
        onToggleCategory={vi.fn()}
      />
    );

    ids.forEach((id) => expect(screen.getByLabelText(id)).not.toBeDisabled());
  });

  it('click en una categoría disponible llama onToggleCategory con su id', () => {
    const onToggleCategory = vi.fn();
    render(
      <CategoryMultiSelect
        series={series(['a', 'b'])}
        selectedCategoryIds={[]}
        isSelectionFull={false}
        onToggleCategory={onToggleCategory}
      />
    );

    fireEvent.click(screen.getByLabelText('b'));

    expect(onToggleCategory).toHaveBeenCalledWith('b');
  });

  it('sin categorías disponibles, muestra el mensaje correspondiente', () => {
    render(
      <CategoryMultiSelect
        series={[]}
        selectedCategoryIds={[]}
        isSelectionFull={false}
        onToggleCategory={vi.fn()}
      />
    );

    expect(screen.getByText('No hay categorías con movimientos.')).toBeInTheDocument();
  });
});
