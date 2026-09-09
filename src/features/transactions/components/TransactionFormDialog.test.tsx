import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionFormDialog } from './TransactionFormDialog';
import type { Account, Category } from '../../../types';
import type { TransactionFormData } from '../types';

const accounts: Account[] = [
  {
    id: 'acc-1',
    name: 'BBVA',
    type: 'bank',
    balance: 100,
    currency: 'EUR',
    createdAt: '2024-01-01',
  },
];

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

function baseFormData(overrides: Partial<TransactionFormData> = {}): TransactionFormData {
  return {
    amount: '',
    type: 'expense',
    description: '',
    date: '2026-01-01',
    accountId: 'acc-1',
    categoryId: '',
    imageHash: undefined,
    receiptItems: [],
    ...overrides,
  };
}

describe('TransactionFormDialog', () => {
  it('cerrado no renderiza nada', () => {
    render(
      <TransactionFormDialog
        open={false}
        formData={baseFormData()}
        filteredCategories={categories}
        accounts={accounts}
        dateWarning={null}
        saving={false}
        onClose={vi.fn()}
        onTypeChange={vi.fn()}
        onFormDataChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.queryByText('Nueva Transacción')).not.toBeInTheDocument();
  });

  it('cambiar el monto llama onFormDataChange', async () => {
    const onFormDataChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TransactionFormDialog
        open
        formData={baseFormData()}
        filteredCategories={categories}
        accounts={accounts}
        dateWarning={null}
        saving={false}
        onClose={vi.fn()}
        onTypeChange={vi.fn()}
        onFormDataChange={onFormDataChange}
        onSubmit={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText('Monto de la transacción'), '5');

    expect(onFormDataChange).toHaveBeenCalledWith({ amount: '5' });
  });

  it('click en "Ingreso" llama onTypeChange', async () => {
    const onTypeChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TransactionFormDialog
        open
        formData={baseFormData()}
        filteredCategories={categories}
        accounts={accounts}
        dateWarning={null}
        saving={false}
        onClose={vi.fn()}
        onTypeChange={onTypeChange}
        onFormDataChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /Ingreso/i }));

    expect(onTypeChange).toHaveBeenCalledWith('income');
  });

  it('elegir una categoría del dropdown llama onFormDataChange con categoryId', async () => {
    const onFormDataChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TransactionFormDialog
        open
        formData={baseFormData()}
        filteredCategories={categories}
        accounts={accounts}
        dateWarning={null}
        saving={false}
        onClose={vi.fn()}
        onTypeChange={vi.fn()}
        onFormDataChange={onFormDataChange}
        onSubmit={vi.fn()}
      />
    );

    await user.click(screen.getByText('Seleccionar categoría'));
    await user.click(screen.getByText('Comida'));

    expect(onFormDataChange).toHaveBeenCalledWith({ categoryId: 'cat-1' });
  });

  it('muestra la advertencia de fecha cuando dateWarning viene seteado', () => {
    render(
      <TransactionFormDialog
        open
        formData={baseFormData()}
        filteredCategories={categories}
        accounts={accounts}
        dateWarning={{ type: 'error', message: 'Fecha fuera del período cerrado' }}
        saving={false}
        onClose={vi.fn()}
        onTypeChange={vi.fn()}
        onFormDataChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText('Fecha fuera del período cerrado')).toBeInTheDocument();
  });

  it('saving=true deshabilita el botón de submit y muestra "Guardando..."', () => {
    render(
      <TransactionFormDialog
        open
        formData={baseFormData()}
        filteredCategories={categories}
        accounts={accounts}
        dateWarning={null}
        saving
        onClose={vi.fn()}
        onTypeChange={vi.fn()}
        onFormDataChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled();
  });

  it('click en Cancelar llama onClose', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <TransactionFormDialog
        open
        formData={baseFormData()}
        filteredCategories={categories}
        accounts={accounts}
        dateWarning={null}
        saving={false}
        onClose={onClose}
        onTypeChange={vi.fn()}
        onFormDataChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalled();
  });
});
