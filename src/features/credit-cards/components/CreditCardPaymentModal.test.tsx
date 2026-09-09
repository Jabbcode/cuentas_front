import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreditCardPaymentModal } from './CreditCardPaymentModal';
import type { CreditCardStatement, Account } from '../../../types';
import type { PaymentFormData } from '../types';

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
      balance: 100,
      transactions: [],
      isPaid: false,
      paymentDueDate: '2026-01-10',
      daysUntilDue: 5,
    },
    creditLimit: 1000,
    available: 900,
    usagePercentage: 10,
    alerts: [],
    ...overrides,
  };
}

function makeFormData(overrides: Partial<PaymentFormData> = {}): PaymentFormData {
  return { amount: '', paymentAccountId: '', paymentDate: '2026-01-05', ...overrides };
}

function makeAccounts(): Account[] {
  return [
    {
      id: 'account-1',
      name: 'Cuenta Bancaria',
      type: 'bank',
      balance: 500,
      currency: 'EUR',
      createdAt: '2026-01-01',
    },
  ];
}

describe('CreditCardPaymentModal', () => {
  it('closed=false: no renderiza nada', () => {
    const { container } = render(
      <CreditCardPaymentModal
        open={false}
        statement={makeStatement()}
        formData={makeFormData()}
        accounts={makeAccounts()}
        paying={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormChange={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra el nombre de la tarjeta y el saldo del período cerrado', () => {
    render(
      <CreditCardPaymentModal
        open
        statement={makeStatement()}
        formData={makeFormData()}
        accounts={makeAccounts()}
        paying={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormChange={vi.fn()}
      />
    );

    expect(screen.getByText('Visa')).toBeInTheDocument();
    expect(screen.getByText('100,00 €')).toBeInTheDocument();
  });

  it('statement null: no muestra los campos del form (solo header/footer)', () => {
    render(
      <CreditCardPaymentModal
        open
        statement={null}
        formData={makeFormData()}
        accounts={makeAccounts()}
        paying={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormChange={vi.fn()}
      />
    );

    expect(screen.queryByLabelText('Monto a pagar')).not.toBeInTheDocument();
  });

  it('escribir el monto llama a onFormChange con el valor', async () => {
    const user = userEvent.setup();
    const onFormChange = vi.fn();
    render(
      <CreditCardPaymentModal
        open
        statement={makeStatement()}
        formData={makeFormData()}
        accounts={makeAccounts()}
        paying={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormChange={onFormChange}
      />
    );

    await user.type(screen.getByLabelText('Monto a pagar'), '5');

    expect(onFormChange).toHaveBeenCalledWith({ amount: '5' });
  });

  it('paying=true: botón deshabilitado y dice "Procesando..."', () => {
    render(
      <CreditCardPaymentModal
        open
        statement={makeStatement()}
        formData={makeFormData()}
        accounts={makeAccounts()}
        paying
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormChange={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Procesando...' })).toBeDisabled();
  });

  it('click en Cancelar llama a onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <CreditCardPaymentModal
        open
        statement={makeStatement()}
        formData={makeFormData()}
        accounts={makeAccounts()}
        paying={false}
        onClose={onClose}
        onSubmit={vi.fn()}
        onFormChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('submit del form dispara onSubmit', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <CreditCardPaymentModal
        open
        statement={makeStatement()}
        formData={makeFormData({ amount: '50', paymentAccountId: 'account-1' })}
        accounts={makeAccounts()}
        paying={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        onFormChange={vi.fn()}
      />
    );

    screen.getByRole('button', { name: 'Pagar' }).closest('form')!.requestSubmit();

    expect(onSubmit).toHaveBeenCalled();
  });
});
