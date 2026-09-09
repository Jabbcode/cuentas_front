import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CreditCardSummary } from './CreditCardSummary';
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
      balance: 100,
      transactions: [],
      daysUntilCutoff: 5,
    },
    closedPeriod: {
      startDate: '2025-12-01',
      endDate: '2025-12-31',
      balance: 50,
      transactions: [],
      isPaid: false,
      paymentDueDate: '2026-01-10',
      daysUntilDue: 5,
    },
    creditLimit: 1000,
    available: 850,
    usagePercentage: 15,
    alerts: [],
    ...overrides,
  };
}

describe('CreditCardSummary', () => {
  it('totalToPay: suma solo los períodos cerrados NO pagados', () => {
    const statements = [
      makeStatement({
        closedPeriod: {
          startDate: '',
          endDate: '',
          balance: 100,
          transactions: [],
          isPaid: false,
          paymentDueDate: '',
          daysUntilDue: 1,
        },
      }),
      makeStatement({
        closedPeriod: {
          startDate: '',
          endDate: '',
          balance: 200,
          transactions: [],
          isPaid: true,
          paymentDueDate: '',
          daysUntilDue: 1,
        },
      }),
    ];

    render(<CreditCardSummary statements={statements} />);

    expect(screen.getByText('100,00 €')).toBeInTheDocument();
    expect(screen.getByText('1 tarjeta(s) pendiente(s)')).toBeInTheDocument();
  });

  it('Período Actual: suma el balance del período actual de todas las tarjetas', () => {
    const statements = [
      makeStatement({
        currentPeriod: {
          startDate: '',
          endDate: '',
          balance: 100,
          transactions: [],
          daysUntilCutoff: 1,
        },
      }),
      makeStatement({
        currentPeriod: {
          startDate: '',
          endDate: '',
          balance: 50,
          transactions: [],
          daysUntilCutoff: 1,
        },
      }),
    ];

    render(<CreditCardSummary statements={statements} />);

    expect(screen.getByText('150,00 €')).toBeInTheDocument();
  });

  it('Total Usado: actual + cerrado no pagado, y muestra la cantidad de tarjetas', () => {
    const statements = [
      makeStatement({
        currentPeriod: {
          startDate: '',
          endDate: '',
          balance: 100,
          transactions: [],
          daysUntilCutoff: 1,
        },
        closedPeriod: {
          startDate: '',
          endDate: '',
          balance: 50,
          transactions: [],
          isPaid: false,
          paymentDueDate: '',
          daysUntilDue: 1,
        },
      }),
    ];

    render(<CreditCardSummary statements={statements} />);

    expect(screen.getByText('150,00 €')).toBeInTheDocument();
    expect(screen.getByText('Entre 1 tarjeta(s)')).toBeInTheDocument();
  });

  it('sin tarjetas: todos los totales quedan en 0', () => {
    render(<CreditCardSummary statements={[]} />);

    expect(screen.getByText('0 tarjeta(s) pendiente(s)')).toBeInTheDocument();
    expect(screen.getByText('Entre 0 tarjeta(s)')).toBeInTheDocument();
  });
});
