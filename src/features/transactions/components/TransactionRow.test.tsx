import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionRow } from './TransactionRow';
import type { Transaction, Account } from '../../../types';

const account: Account = {
  id: 'acc-1',
  name: 'BBVA',
  type: 'bank',
  balance: 100,
  currency: 'EUR',
  createdAt: '2024-01-01',
};

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'tx-1',
    amount: 25,
    type: 'expense',
    date: '2026-01-05',
    accountId: 'acc-1',
    categoryId: 'cat-1',
    createdAt: '2026-01-05',
    ...overrides,
  } as Transaction;
}

describe('TransactionRow', () => {
  it('muestra descripción, monto con signo y fecha', () => {
    render(
      <TransactionRow
        transaction={makeTx({ description: 'Café', amount: 3.5, type: 'expense' })}
        accounts={[account]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText('Café')).toBeInTheDocument();
    expect(screen.getByText(/-.*3[.,]50/)).toBeInTheDocument();
  });

  it('un ingreso muestra el monto en verde con signo +', () => {
    render(
      <TransactionRow
        transaction={makeTx({ description: 'Sueldo', amount: 100, type: 'income' })}
        accounts={[account]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText(/\+.*100/)).toHaveClass('text-green-600');
  });

  it('llama onEdit/onDelete con la transacción/id correctos', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const tx = makeTx();
    const user = userEvent.setup();
    render(
      <TransactionRow transaction={tx} accounts={[account]} onDelete={onDelete} onEdit={onEdit} />
    );

    await user.click(screen.getByTitle('Editar transacción'));
    await user.click(screen.getByTitle('Eliminar transacción'));

    expect(onEdit).toHaveBeenCalledWith(tx);
    expect(onDelete).toHaveBeenCalledWith('tx-1');
  });

  it('muestra el badge "Fijo" para transacciones de gasto fijo', () => {
    render(
      <TransactionRow
        transaction={makeTx({ fixedExpenseId: 'fe-1' })}
        accounts={[account]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText('Fijo')).toBeInTheDocument();
  });

  it('muestra el botón de ver items solo si hay receiptItems y onViewItems', async () => {
    const onViewItems = vi.fn();
    const user = userEvent.setup();
    const tx = makeTx({ receiptItems: [{ id: 'item-1' }] as never });
    render(
      <TransactionRow
        transaction={tx}
        accounts={[account]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onViewItems={onViewItems}
      />
    );

    await user.click(screen.getByTitle(/Ver detalle/));

    expect(onViewItems).toHaveBeenCalledWith(tx);
  });

  it('sin receiptItems no muestra el botón de ver items', () => {
    render(
      <TransactionRow
        transaction={makeTx()}
        accounts={[account]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onViewItems={vi.fn()}
      />
    );

    expect(screen.queryByTitle(/Ver detalle/)).not.toBeInTheDocument();
  });
});
