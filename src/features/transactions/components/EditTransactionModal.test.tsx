import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditTransactionModal } from './EditTransactionModal';
import type { Transaction, Category, Account } from '../../../types';

const account: Account = {
  id: 'acc-1',
  name: 'BBVA',
  type: 'bank',
  balance: 100,
  currency: 'EUR',
  createdAt: '2024-01-01',
};

const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Comida',
    type: 'expense',
    icon: null,
    color: null,
    userId: 'u1',
    createdAt: '2024-01-01',
  },
];

const tx: Transaction = {
  id: 'tx-1',
  amount: 20,
  type: 'expense',
  description: 'Super',
  date: '2026-01-05',
  accountId: 'acc-1',
  categoryId: 'cat-1',
  account: { id: 'acc-1', name: 'BBVA' },
  createdAt: '2026-01-05',
} as unknown as Transaction;

describe('EditTransactionModal', () => {
  it('sin transacción no renderiza nada', () => {
    render(
      <EditTransactionModal
        open
        transaction={null}
        categories={categories}
        account={account}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.queryByText('Editar Transacción')).not.toBeInTheDocument();
  });

  it('precarga descripción y monto de la transacción', () => {
    render(
      <EditTransactionModal
        open
        transaction={tx}
        categories={categories}
        account={account}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('Super')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20')).toBeInTheDocument();
  });

  it('cambiar el monto muestra la advertencia de impacto en el balance', async () => {
    const user = userEvent.setup();
    render(
      <EditTransactionModal
        open
        transaction={tx}
        categories={categories}
        account={account}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const amountInput = screen.getByDisplayValue('20');
    await user.clear(amountInput);
    await user.type(amountInput, '30');

    await waitFor(() =>
      expect(
        screen.getByText('Cambiar el monto afectará el balance de tu cuenta')
      ).toBeInTheDocument()
    );
  });

  it('enviar el formulario llama onSave con el id y los datos, y luego onClose', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <EditTransactionModal
        open
        transaction={tx}
        categories={categories}
        account={account}
        onClose={onClose}
        onSave={onSave}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Guardar Cambios' }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith('tx-1', expect.objectContaining({ categoryId: 'cat-1' }))
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('si onSave falla, no cierra el modal', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('boom'));
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <EditTransactionModal
        open
        transaction={tx}
        categories={categories}
        account={account}
        onClose={onClose}
        onSave={onSave}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Guardar Cambios' }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
  });

  it('click en Cancelar llama onClose', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <EditTransactionModal
        open
        transaction={tx}
        categories={categories}
        account={account}
        onClose={onClose}
        onSave={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalled();
  });
});
