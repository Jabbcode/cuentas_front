import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreditCardExpenseModal } from './CreditCardExpenseModal';
import type { CreditCardStatement, Category } from '../../../types';
import type { ExpenseFormData } from '../types';

function makeStatement(overrides: Partial<CreditCardStatement> = {}): CreditCardStatement {
  return {
    account: {
      id: 'card-1',
      name: 'Visa',
      type: 'credit_card',
      balance: 0,
      currency: 'EUR',
      createdAt: '2026-01-01',
    },
    currentPeriod: {
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      balance: 0,
      transactions: [],
      daysUntilCutoff: 5,
    },
    closedPeriod: {
      startDate: '2025-12-01',
      endDate: '2025-12-31',
      balance: 0,
      transactions: [],
      isPaid: true,
      paymentDueDate: '2026-01-10',
      daysUntilDue: 5,
    },
    creditLimit: 1000,
    available: 1000,
    usagePercentage: 0,
    alerts: [],
    ...overrides,
  };
}

function makeFormData(overrides: Partial<ExpenseFormData> = {}): ExpenseFormData {
  return { amount: '', categoryId: '', date: '2026-01-05', description: '', ...overrides };
}

function makeCategories(): Category[] {
  return [{ id: 'cat-1', name: 'Compras', type: 'expense', icon: 'shopping-cart' }];
}

describe('CreditCardExpenseModal', () => {
  it('open=false: no renderiza nada', () => {
    const { container } = render(
      <CreditCardExpenseModal
        open={false}
        statement={makeStatement()}
        formData={makeFormData()}
        categories={makeCategories()}
        saving={false}
        onClose={vi.fn()}
        onFormChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra el nombre de la tarjeta', () => {
    render(
      <CreditCardExpenseModal
        open
        statement={makeStatement()}
        formData={makeFormData()}
        categories={makeCategories()}
        saving={false}
        onClose={vi.fn()}
        onFormChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText('Visa')).toBeInTheDocument();
  });

  it('escribir el monto llama a onFormChange', async () => {
    const user = userEvent.setup();
    const onFormChange = vi.fn();
    render(
      <CreditCardExpenseModal
        open
        statement={makeStatement()}
        formData={makeFormData()}
        categories={makeCategories()}
        saving={false}
        onClose={vi.fn()}
        onFormChange={onFormChange}
        onSubmit={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText('Monto del gasto'), '9');

    expect(onFormChange).toHaveBeenCalledWith({ amount: '9' });
  });

  it('seleccionar una categoría del dropdown llama a onFormChange con el categoryId', async () => {
    const user = userEvent.setup();
    const onFormChange = vi.fn();
    render(
      <CreditCardExpenseModal
        open
        statement={makeStatement()}
        formData={makeFormData()}
        categories={makeCategories()}
        saving={false}
        onClose={vi.fn()}
        onFormChange={onFormChange}
        onSubmit={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Seleccionar categoría' }));
    await user.click(screen.getByRole('button', { name: 'Compras' }));

    expect(onFormChange).toHaveBeenCalledWith({ categoryId: 'cat-1' });
  });

  it('saving=true: botón deshabilitado y dice "Guardando..."', () => {
    render(
      <CreditCardExpenseModal
        open
        statement={makeStatement()}
        formData={makeFormData()}
        categories={makeCategories()}
        saving
        onClose={vi.fn()}
        onFormChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled();
  });

  it('click en Cancelar llama a onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <CreditCardExpenseModal
        open
        statement={makeStatement()}
        formData={makeFormData()}
        categories={makeCategories()}
        saving={false}
        onClose={onClose}
        onFormChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalled();
  });
});
