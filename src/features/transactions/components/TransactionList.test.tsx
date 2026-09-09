import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionList } from './TransactionList';
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

describe('TransactionList', () => {
  it('sin transacciones muestra el estado vacío', () => {
    render(
      <TransactionList
        transactions={[]}
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

  it('con transacciones renderiza una card por cada una', () => {
    render(
      <TransactionList
        transactions={[tx, { ...tx, id: 'tx-2' }]}
        accounts={[account]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onCreateClick={vi.fn()}
      />
    );

    expect(screen.getAllByTitle('Editar transacción')).toHaveLength(2);
  });
});
