import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardAlertsSection } from './DashboardAlertsSection';
import type { DebtsSummary, CreditCardsSummary, FixedExpenseSummary } from '../../../types';

describe('DashboardAlertsSection', () => {
  it('sin alertas: no renderiza nada', () => {
    const { container } = render(
      <DashboardAlertsSection
        debtsSummary={null}
        creditCardsSummary={null}
        fixedSummary={null}
        isOpen={false}
        onToggle={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('con deudas vencidas: muestra el botón "Atención requerida"', () => {
    const debts: DebtsSummary = {
      totalActiveDebts: 1,
      totalOverdueDebts: 1,
      totalDebtAmount: 100,
      totalOverdueAmount: 100,
      debtsDueSoon: 0,
      upcomingDebts: [],
    };
    render(
      <DashboardAlertsSection
        debtsSummary={debts}
        creditCardsSummary={null}
        fixedSummary={null}
        isOpen={false}
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByText('Atención requerida')).toBeInTheDocument();
  });

  it('cerrado: no muestra el detalle de las alertas', () => {
    const debts: DebtsSummary = {
      totalActiveDebts: 1,
      totalOverdueDebts: 1,
      totalDebtAmount: 100,
      totalOverdueAmount: 100,
      debtsDueSoon: 0,
      upcomingDebts: [],
    };
    render(
      <DashboardAlertsSection
        debtsSummary={debts}
        creditCardsSummary={null}
        fixedSummary={null}
        isOpen={false}
        onToggle={vi.fn()}
      />
    );
    expect(screen.queryByText(/deuda vencida/)).not.toBeInTheDocument();
  });

  it('abierto: muestra el detalle de deudas vencidas', () => {
    const debts: DebtsSummary = {
      totalActiveDebts: 1,
      totalOverdueDebts: 2,
      totalDebtAmount: 100,
      totalOverdueAmount: 300,
      debtsDueSoon: 0,
      upcomingDebts: [],
    };
    render(
      <DashboardAlertsSection
        debtsSummary={debts}
        creditCardsSummary={null}
        fixedSummary={null}
        isOpen
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByText(/2 deudas vencidas/)).toBeInTheDocument();
    expect(screen.getByText(/300,00 €/)).toBeInTheDocument();
  });

  it('click en el header llama a onToggle', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const debts: DebtsSummary = {
      totalActiveDebts: 1,
      totalOverdueDebts: 1,
      totalDebtAmount: 100,
      totalOverdueAmount: 100,
      debtsDueSoon: 0,
      upcomingDebts: [],
    };
    render(
      <DashboardAlertsSection
        debtsSummary={debts}
        creditCardsSummary={null}
        fixedSummary={null}
        isOpen={false}
        onToggle={onToggle}
      />
    );

    await user.click(screen.getByText('Atención requerida'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('tarjeta con uso alto: muestra la alerta con el nombre de la cuenta', () => {
    const ccSummary: CreditCardsSummary = {
      totalToPay: 0,
      upcomingPayments: [],
      alerts: [],
      cards: [
        {
          account: {
            id: 'card-1',
            name: 'Visa',
            type: 'credit_card',
            balance: 0,
            currency: 'EUR',
            createdAt: '',
          },
          currentPeriod: {
            startDate: '',
            endDate: '',
            balance: 0,
            transactions: [],
            daysUntilCutoff: 1,
          },
          closedPeriod: {
            startDate: '',
            endDate: '',
            balance: 0,
            transactions: [],
            isPaid: true,
            paymentDueDate: '',
            daysUntilDue: 1,
          },
          creditLimit: 100,
          available: 5,
          usagePercentage: 0.95,
          alerts: [],
        },
      ],
    };
    render(
      <DashboardAlertsSection
        debtsSummary={null}
        creditCardsSummary={ccSummary}
        fixedSummary={null}
        isOpen
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByText(/Visa — uso al/)).toBeInTheDocument();
  });

  it('gasto fijo próximo a vencer y no pagado: muestra la alerta', () => {
    const fixedSummary: FixedExpenseSummary = {
      totalMonthlyExpenses: 0,
      totalMonthlyIncome: 0,
      totalCount: 1,
      paidCount: 0,
      pendingCount: 1,
      items: [
        {
          id: 'fe-1',
          name: 'Renta',
          amount: 500,
          type: 'expense',
          dueDay: new Date().getDate(),
          accountId: 'acc-1',
          categoryId: 'cat-1',
          isActive: true,
          isPaidThisMonth: false,
        } as never,
      ],
    };
    render(
      <DashboardAlertsSection
        debtsSummary={null}
        creditCardsSummary={null}
        fixedSummary={fixedSummary}
        isOpen
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByText(/Renta vence el día/)).toBeInTheDocument();
  });
});
