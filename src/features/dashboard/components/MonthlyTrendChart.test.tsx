import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('recharts', () => ({
  BarChart: ({ data }: { data: unknown[] }) => (
    <div data-testid="bar-chart">{JSON.stringify(data)}</div>
  ),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { MonthlyTrendChart } from './MonthlyTrendChart';

describe('MonthlyTrendChart', () => {
  it('loading=true: muestra el spinner, no el gráfico', () => {
    render(<MonthlyTrendChart data={[]} loading />);

    expect(screen.getByText('Tendencia Mensual')).toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('sin datos: muestra "No hay datos disponibles"', () => {
    render(<MonthlyTrendChart data={[]} />);

    expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument();
  });

  it('con datos: renderiza el gráfico con los meses mapeados a Ingresos/Gastos', () => {
    render(<MonthlyTrendChart data={[{ month: 'ene', income: 100, expenses: 50, net: 50 }]} />);

    const chart = screen.getByTestId('bar-chart');
    expect(chart.textContent).toContain('"Ingresos":100');
    expect(chart.textContent).toContain('"Gastos":50');
  });
});
