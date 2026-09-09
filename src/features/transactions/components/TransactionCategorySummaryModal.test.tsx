import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionCategorySummaryModal } from './TransactionCategorySummaryModal';
import type { TransactionCategorySummaryItem } from '../api';

const item: TransactionCategorySummaryItem = {
  category: { id: 'cat-1', name: 'Comida', icon: null, color: null },
  expenseTotal: 50,
  incomeTotal: 0,
  count: 3,
  netTotal: -50,
};

describe('TransactionCategorySummaryModal', () => {
  it('loading muestra el spinner', () => {
    render(
      <TransactionCategorySummaryModal
        open
        summary={[]}
        loading
        onClose={vi.fn()}
        onCategoryClick={vi.fn()}
      />
    );

    expect(document.querySelector('.motion-safe\\:animate-spin')).toBeInTheDocument();
  });

  it('sin datos muestra el mensaje vacío', () => {
    render(
      <TransactionCategorySummaryModal
        open
        summary={[]}
        loading={false}
        onClose={vi.fn()}
        onCategoryClick={vi.fn()}
      />
    );

    expect(screen.getByText('Sin transacciones para el período seleccionado')).toBeInTheDocument();
  });

  it('con datos muestra la categoría, el conteo y el total', () => {
    render(
      <TransactionCategorySummaryModal
        open
        summary={[item]}
        loading={false}
        onClose={vi.fn()}
        onCategoryClick={vi.fn()}
      />
    );

    expect(screen.getByText('Comida')).toBeInTheDocument();
    expect(screen.getByText('3 transacciones')).toBeInTheDocument();
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it('click en una categoría llama onCategoryClick y onClose', async () => {
    const onCategoryClick = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <TransactionCategorySummaryModal
        open
        summary={[item]}
        loading={false}
        onClose={onClose}
        onCategoryClick={onCategoryClick}
      />
    );

    await user.click(screen.getByText('Comida'));

    expect(onCategoryClick).toHaveBeenCalledWith('cat-1');
    expect(onClose).toHaveBeenCalled();
  });
});
