import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionGroupedView } from './TransactionGroupedView';
import type { GroupedTransaction } from '../utils';
import type { Transaction, Account } from '../../../types';

const account: Account = {
  id: 'acc-1',
  name: 'BBVA',
  type: 'bank',
  balance: 100,
  currency: 'EUR',
  createdAt: '2024-01-01',
};

const tx = {
  id: 'tx-1',
  amount: 10,
  type: 'expense',
  date: '2026-01-01',
  accountId: 'acc-1',
  categoryId: 'cat-1',
  createdAt: '2026-01-01',
} as unknown as Transaction;

const group: GroupedTransaction = {
  category: { id: 'cat-1', name: 'Comida', icon: null, color: null },
  transactions: [tx],
  total: -10,
};

describe('TransactionGroupedView', () => {
  it('sin grupos muestra el estado vacío', () => {
    render(
      <TransactionGroupedView
        groupedTransactions={[]}
        accounts={[account]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onCreateClick={vi.fn()}
      />
    );

    expect(
      screen.getByText('No se encontraron transacciones con los filtros seleccionados.')
    ).toBeInTheDocument();
  });

  it('con grupos muestra el nombre de categoría, cantidad y total', () => {
    render(
      <TransactionGroupedView
        groupedTransactions={[group]}
        accounts={[account]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onCreateClick={vi.fn()}
      />
    );

    expect(screen.getByText('Comida')).toBeInTheDocument();
    expect(screen.getByText('1 transacciones')).toBeInTheDocument();
  });

  it('un total positivo se muestra en verde con signo +', () => {
    render(
      <TransactionGroupedView
        groupedTransactions={[{ ...group, total: 50 }]}
        accounts={[account]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onCreateClick={vi.fn()}
      />
    );

    const amount = screen.getByText(/\+.*50/);
    expect(amount).toHaveClass('text-green-600');
  });
});
