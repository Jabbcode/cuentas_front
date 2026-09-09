import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MonthlyFixedSummary } from './MonthlyFixedSummary';
import type { FixedExpenseSummary } from '../../../types';

function makeSummary(overrides: Partial<FixedExpenseSummary> = {}): FixedExpenseSummary {
  return {
    totalMonthlyExpenses: 500,
    totalMonthlyIncome: 800,
    totalCount: 4,
    paidCount: 3,
    pendingCount: 1,
    items: [],
    ...overrides,
  } as FixedExpenseSummary;
}

describe('MonthlyFixedSummary', () => {
  it('balance positivo: muestra superávit', () => {
    render(<MonthlyFixedSummary summary={makeSummary()} />);

    expect(screen.getByText('300,00 €')).toBeInTheDocument(); // 800-500
    expect(screen.getByText('superávit mensual')).toBeInTheDocument();
    expect(screen.getByText('3/4')).toBeInTheDocument();
  });

  it('balance negativo: muestra déficit', () => {
    render(<MonthlyFixedSummary summary={makeSummary({ totalMonthlyExpenses: 1000 })} />);

    expect(screen.getByText('déficit mensual')).toBeInTheDocument();
  });

  it('sin items (totalCount 0): el progreso no falla (0%)', () => {
    render(
      <MonthlyFixedSummary
        summary={makeSummary({ totalCount: 0, paidCount: 0, pendingCount: 0 })}
      />
    );

    expect(screen.getByText('0/0')).toBeInTheDocument();
  });
});
