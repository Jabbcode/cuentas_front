import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextMonthProjection } from './NextMonthProjection';
import type { ProjectionData } from '../../../types';

function makeProjection(overrides: Partial<ProjectionData> = {}): ProjectionData {
  return {
    month: '2026-02-01',
    year: 2026,
    monthNumber: 2,
    totalExpenses: 300,
    totalIncome: 500,
    netBalance: 200,
    expensesByCategory: [],
    incomesByCategory: [],
    comparison: {
      previousMonth: '2026-01-01',
      expensesDiff: 0,
      incomeDiff: 0,
      netDiff: 0,
      expensesPercentage: 0,
      incomePercentage: 0,
    },
    ...overrides,
  };
}

describe('NextMonthProjection', () => {
  it('cerrado: no muestra el contenido detallado', () => {
    render(<NextMonthProjection projection={makeProjection()} isOpen={false} onToggle={vi.fn()} />);

    expect(screen.queryByText('Ingresos')).not.toBeInTheDocument();
  });

  it('abierto: muestra ingresos, gastos y balance', () => {
    render(<NextMonthProjection projection={makeProjection()} isOpen onToggle={vi.fn()} />);

    expect(screen.getByText('500,00 €')).toBeInTheDocument();
    expect(screen.getByText('300,00 €')).toBeInTheDocument();
    expect(screen.getByText('200,00 €')).toBeInTheDocument();
  });

  it('click en el header llama a onToggle', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <NextMonthProjection projection={makeProjection()} isOpen={false} onToggle={onToggle} />
    );

    await user.click(screen.getByText(/Proyección/));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('con desglose de gastos: muestra las categorías y sus items', () => {
    render(
      <NextMonthProjection
        projection={makeProjection({
          expensesByCategory: [
            {
              categoryId: 'cat-1',
              categoryName: 'Vivienda',
              categoryIcon: null,
              categoryColor: null,
              total: 300,
              items: [{ id: 'fe-1', name: 'Renta', amount: 300, dueDay: 5 }],
            },
          ],
        })}
        isOpen
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('Desglose de Gastos')).toBeInTheDocument();
    expect(screen.getByText('Vivienda')).toBeInTheDocument();
    expect(screen.getByText(/Renta \(día 5\)/)).toBeInTheDocument();
  });

  it('sin desglose: no muestra las secciones de desglose', () => {
    render(<NextMonthProjection projection={makeProjection()} isOpen onToggle={vi.fn()} />);

    expect(screen.queryByText('Desglose de Gastos')).not.toBeInTheDocument();
    expect(screen.queryByText('Desglose de Ingresos')).not.toBeInTheDocument();
  });
});
