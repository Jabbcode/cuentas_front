import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreditCardPeriod } from './CreditCardPeriod';

describe('CreditCardPeriod', () => {
  it('período actual: muestra "Período Actual" y los días para el corte', () => {
    render(
      <CreditCardPeriod
        type="current"
        period={{
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          balance: 200,
          transactions: [],
          daysUntilCutoff: 5,
        }}
      />
    );

    expect(screen.getByText('Período Actual')).toBeInTheDocument();
    expect(screen.getByText(/5 días/)).toBeInTheDocument();
  });

  it('período cerrado con saldo 0: muestra "Sin saldo"', () => {
    render(
      <CreditCardPeriod
        type="closed"
        period={{
          startDate: '2025-12-01',
          endDate: '2025-12-31',
          balance: 0,
          transactions: [],
          isPaid: false,
          paymentDueDate: '2026-01-10',
          daysUntilDue: 5,
        }}
      />
    );

    expect(screen.getByText('Sin saldo')).toBeInTheDocument();
  });

  it('período cerrado pagado: muestra el badge "Pagado"', () => {
    render(
      <CreditCardPeriod
        type="closed"
        period={{
          startDate: '2025-12-01',
          endDate: '2025-12-31',
          balance: 100,
          transactions: [],
          isPaid: true,
          paymentDueDate: '2026-01-10',
          daysUntilDue: 5,
        }}
      />
    );

    expect(screen.getByText('Pagado')).toBeInTheDocument();
  });

  it('vence hoy: muestra "(hoy)"', () => {
    render(
      <CreditCardPeriod
        type="closed"
        period={{
          startDate: '2025-12-01',
          endDate: '2025-12-31',
          balance: 100,
          transactions: [],
          isPaid: false,
          paymentDueDate: '2026-01-10',
          daysUntilDue: 0,
        }}
      />
    );

    expect(screen.getByText(/hoy/)).toBeInTheDocument();
  });

  it('vence mañana: muestra "(mañana)"', () => {
    render(
      <CreditCardPeriod
        type="closed"
        period={{
          startDate: '2025-12-01',
          endDate: '2025-12-31',
          balance: 100,
          transactions: [],
          isPaid: false,
          paymentDueDate: '2026-01-10',
          daysUntilDue: 1,
        }}
      />
    );

    expect(screen.getByText(/mañana/)).toBeInTheDocument();
  });

  it('ya venció: muestra "(vencido)"', () => {
    render(
      <CreditCardPeriod
        type="closed"
        period={{
          startDate: '2025-12-01',
          endDate: '2025-12-31',
          balance: 100,
          transactions: [],
          isPaid: false,
          paymentDueDate: '2026-01-10',
          daysUntilDue: -2,
        }}
      />
    );

    expect(screen.getByText(/vencido/)).toBeInTheDocument();
  });

  it('sin pagar y con saldo: el botón Pagar está habilitado y llama a onPayClick', async () => {
    const user = userEvent.setup();
    const onPayClick = vi.fn();
    render(
      <CreditCardPeriod
        type="closed"
        period={{
          startDate: '2025-12-01',
          endDate: '2025-12-31',
          balance: 100,
          transactions: [],
          isPaid: false,
          paymentDueDate: '2026-01-10',
          daysUntilDue: 5,
        }}
        onPayClick={onPayClick}
      />
    );

    const button = screen.getByRole('button', { name: /Pagar/ });
    expect(button).toBeEnabled();
    await user.click(button);

    expect(onPayClick).toHaveBeenCalledTimes(1);
  });

  it('saldo 0: el botón Pagar está deshabilitado', () => {
    render(
      <CreditCardPeriod
        type="closed"
        period={{
          startDate: '2025-12-01',
          endDate: '2025-12-31',
          balance: 0,
          transactions: [],
          isPaid: false,
          paymentDueDate: '2026-01-10',
          daysUntilDue: 5,
        }}
        onPayClick={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Pagar' })).toBeDisabled();
  });

  it('ya pagado: no muestra el botón Pagar', () => {
    render(
      <CreditCardPeriod
        type="closed"
        period={{
          startDate: '2025-12-01',
          endDate: '2025-12-31',
          balance: 100,
          transactions: [],
          isPaid: true,
          paymentDueDate: '2026-01-10',
          daysUntilDue: 5,
        }}
        onPayClick={vi.fn()}
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('muestra la cantidad de transacciones del período', () => {
    render(
      <CreditCardPeriod
        type="current"
        period={{
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          balance: 0,
          transactions: [{ id: 't1' } as never, { id: 't2' } as never],
          daysUntilCutoff: 1,
        }}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
