import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardHeroCard } from './DashboardHeroCard';
import type { DashboardSummary } from '../../../types';

function makeSummary(overrides: Partial<DashboardSummary> = {}): DashboardSummary {
  return {
    totalBalance: 1000,
    monthlyIncome: 500,
    monthlyExpenses: 200,
    monthlyNet: 300,
    month: 'enero 2026',
    ...overrides,
  };
}

describe('DashboardHeroCard', () => {
  it('summary null: usa 0 en todos los valores', () => {
    render(<DashboardHeroCard summary={null} />);

    expect(screen.getAllByText('0,00 €').length).toBe(3);
  });

  it('neto positivo: muestra el balance en verde', () => {
    render(<DashboardHeroCard summary={makeSummary({ monthlyNet: 300 })} />);

    expect(screen.getByText('300,00 €')).toHaveClass('text-green-600');
  });

  it('neto negativo: muestra el balance en rojo', () => {
    render(
      <DashboardHeroCard
        summary={makeSummary({ monthlyNet: -50, monthlyIncome: 100, monthlyExpenses: 150 })}
      />
    );

    expect(screen.getByText('-50,00 €')).toHaveClass('text-red-600');
  });

  it('muestra ingresos y gastos del mes', () => {
    render(
      <DashboardHeroCard summary={makeSummary({ monthlyIncome: 500, monthlyExpenses: 200 })} />
    );

    expect(screen.getByText('500,00 €')).toBeInTheDocument();
    expect(screen.getByText('200,00 €')).toBeInTheDocument();
  });

  it('calcula el porcentaje gastado como gastos/ingresos', () => {
    render(
      <DashboardHeroCard summary={makeSummary({ monthlyIncome: 200, monthlyExpenses: 100 })} />
    );

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('sin ingresos: el porcentaje gastado es 0% (sin división por cero)', () => {
    render(<DashboardHeroCard summary={makeSummary({ monthlyIncome: 0, monthlyExpenses: 100 })} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
