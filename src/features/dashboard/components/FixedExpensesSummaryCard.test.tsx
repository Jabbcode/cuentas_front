import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FixedExpensesSummaryCard } from './FixedExpensesSummaryCard';
import type { FixedExpenseSummary } from '../../../types';

function makeSummary(overrides: Partial<FixedExpenseSummary> = {}): FixedExpenseSummary {
  return {
    totalMonthlyExpenses: 500,
    totalMonthlyIncome: 0,
    totalCount: 4,
    paidCount: 2,
    pendingCount: 2,
    items: [],
    ...overrides,
  };
}

function renderCard(summary: FixedExpenseSummary) {
  return render(
    <MemoryRouter>
      <FixedExpensesSummaryCard summary={summary} />
    </MemoryRouter>
  );
}

describe('FixedExpensesSummaryCard', () => {
  it('muestra el total mensual', () => {
    renderCard(makeSummary({ totalMonthlyExpenses: 500 }));
    expect(screen.getByText('500,00 €')).toBeInTheDocument();
  });

  it('muestra pagados/total y pendientes', () => {
    renderCard(makeSummary({ paidCount: 2, totalCount: 4, pendingCount: 2 }));
    expect(screen.getByText('2/4')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('con pendientes > 0: muestra el aviso de gastos pendientes', () => {
    renderCard(makeSummary({ pendingCount: 3 }));
    expect(screen.getByText('3 gasto(s) pendiente(s) este mes')).toBeInTheDocument();
  });

  it('sin pendientes: no muestra el aviso', () => {
    renderCard(makeSummary({ pendingCount: 0 }));
    expect(screen.queryByText(/pendiente\(s\) este mes/)).not.toBeInTheDocument();
  });
});
