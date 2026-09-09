import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreditCardHeader } from './CreditCardHeader';
import type { CreditCardStatement } from '../../../types';

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
      balance: 300,
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
    available: 700,
    usagePercentage: 30,
    alerts: [],
    ...overrides,
  };
}

describe('CreditCardHeader', () => {
  it('muestra el nombre de la cuenta y el límite', () => {
    render(<CreditCardHeader statement={makeStatement()} />);

    expect(screen.getByText('Visa')).toBeInTheDocument();
    expect(screen.getByText(/Límite: /)).toBeInTheDocument();
  });

  it('calcula el crédito disponible como límite - usado', () => {
    render(
      <CreditCardHeader
        statement={makeStatement({
          creditLimit: 1000,
          currentPeriod: {
            startDate: '',
            endDate: '',
            balance: 300,
            transactions: [],
            daysUntilCutoff: 1,
          },
        })}
      />
    );

    // available = 1000 - 300 = 700
    expect(screen.getByText('700,00 €')).toBeInTheDocument();
  });

  it('sin onToggleCollapse: no muestra el botón de colapsar', () => {
    render(<CreditCardHeader statement={makeStatement()} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('con onToggleCollapse: el botón cambia de aria-label según isCollapsed', async () => {
    const user = userEvent.setup();
    const onToggleCollapse = vi.fn();
    render(
      <CreditCardHeader
        statement={makeStatement()}
        isCollapsed={false}
        onToggleCollapse={onToggleCollapse}
      />
    );

    const button = screen.getByRole('button', { name: 'Colapsar tarjeta' });
    await user.click(button);

    expect(onToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it('isCollapsed=true: aria-label dice "Expandir tarjeta"', () => {
    render(<CreditCardHeader statement={makeStatement()} isCollapsed onToggleCollapse={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Expandir tarjeta' })).toBeInTheDocument();
  });

  it('período cerrado sin pagar y con saldo: muestra la advertencia', () => {
    render(
      <CreditCardHeader
        statement={makeStatement({
          closedPeriod: {
            startDate: '',
            endDate: '',
            balance: 150,
            transactions: [],
            isPaid: false,
            paymentDueDate: '',
            daysUntilDue: 2,
          },
        })}
      />
    );

    expect(screen.getByText(/Periodo cerrado sin pagar/)).toBeInTheDocument();
  });

  it('período cerrado pagado: no muestra la advertencia', () => {
    render(
      <CreditCardHeader
        statement={makeStatement({
          closedPeriod: {
            startDate: '',
            endDate: '',
            balance: 150,
            transactions: [],
            isPaid: true,
            paymentDueDate: '',
            daysUntilDue: 2,
          },
        })}
      />
    );

    expect(screen.queryByText(/Periodo cerrado sin pagar/)).not.toBeInTheDocument();
  });
});
