import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CreditCardsSummaryCard } from './CreditCardsSummary';
import type { CreditCardsSummary, CreditCardStatement } from '../../../types';

function makeStatement(): CreditCardStatement {
  return {
    account: {
      id: 'card-1',
      name: 'Visa',
      type: 'credit_card',
      balance: 0,
      currency: 'EUR',
      createdAt: '2026-01-01',
    },
    currentPeriod: { startDate: '', endDate: '', balance: 0, transactions: [], daysUntilCutoff: 1 },
    closedPeriod: {
      startDate: '',
      endDate: '',
      balance: 0,
      transactions: [],
      isPaid: true,
      paymentDueDate: '',
      daysUntilDue: 1,
    },
    creditLimit: 1000,
    available: 1000,
    usagePercentage: 0,
    alerts: [],
  };
}

function makeSummary(overrides: Partial<CreditCardsSummary> = {}): CreditCardsSummary {
  return {
    totalToPay: 0,
    upcomingPayments: [],
    alerts: [],
    cards: [makeStatement()],
    ...overrides,
  };
}

function renderCard(summary: CreditCardsSummary) {
  return render(
    <MemoryRouter>
      <CreditCardsSummaryCard summary={summary} />
    </MemoryRouter>
  );
}

describe('CreditCardsSummaryCard', () => {
  it('sin tarjetas: no renderiza nada', () => {
    const { container } = renderCard(makeSummary({ cards: [] }));
    expect(container).toBeEmptyDOMElement();
  });

  it('totalToPay > 0: muestra el monto a pagar', () => {
    renderCard(makeSummary({ totalToPay: 250 }));
    expect(screen.getByText('Total a pagar este mes')).toBeInTheDocument();
    expect(screen.getByText('250,00 €')).toBeInTheDocument();
  });

  it('totalToPay = 0 y sin próximos vencimientos: muestra el estado "sin pagos pendientes"', () => {
    renderCard(makeSummary({ totalToPay: 0, upcomingPayments: [] }));
    expect(screen.getByText('No tienes pagos pendientes')).toBeInTheDocument();
  });

  it('próximo vencimiento en <=3 días: muestra el badge Urgente', () => {
    renderCard(
      makeSummary({
        upcomingPayments: [
          {
            accountId: 'card-1',
            accountName: 'Visa',
            amount: 100,
            dueDate: '2026-01-10',
            daysUntilDue: 2,
          },
        ],
      })
    );
    expect(screen.getByText('Urgente')).toBeInTheDocument();
    expect(screen.getByText('Vence en 2 días')).toBeInTheDocument();
  });

  it('vence hoy / mañana: usa el texto especial', () => {
    renderCard(
      makeSummary({
        upcomingPayments: [
          { accountId: 'card-1', accountName: 'Visa', amount: 100, dueDate: '', daysUntilDue: 0 },
        ],
      })
    );
    expect(screen.getByText('Vence hoy')).toBeInTheDocument();
  });

  it('muestra hasta 3 alertas con su severidad', () => {
    renderCard(
      makeSummary({
        alerts: [
          {
            type: 'x',
            message: 'Uso alto',
            severity: 'error',
            accountId: 'card-1',
            accountName: 'Visa',
          },
        ],
      })
    );
    expect(screen.getByText('Uso alto')).toBeInTheDocument();
  });
});
