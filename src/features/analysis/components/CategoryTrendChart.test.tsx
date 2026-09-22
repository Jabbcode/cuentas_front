import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const { lineProps } = vi.hoisted(() => ({
  lineProps: {} as Record<
    string,
    { dataKey: string; name: string; dot: (props: unknown) => React.ReactElement }
  >,
}));

vi.mock('recharts', () => ({
  LineChart: ({ data, children }: { data: unknown[]; children: React.ReactNode }) => (
    <div data-testid="line-chart" data-chart={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: (props: { dataKey: string; name: string; dot: (p: unknown) => React.ReactElement }) => {
    lineProps[props.dataKey] = props;
    return <div data-testid={`line-${props.dataKey}`} />;
  },
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { CategoryTrendChart } from './CategoryTrendChart';
import type { CategorySeries } from '../types';

function series(
  id: string,
  name: string,
  points: { month: string; total: number; count: number }[]
): CategorySeries {
  return { category: { id, name, icon: null, color: null }, total: 0, points };
}

const MONTHS = ['2026-01', '2026-02'];
const SERIES: CategorySeries[] = [
  series('cat-a', 'Comida', [
    { month: '2026-01', total: 100, count: 2 },
    { month: '2026-02', total: 0, count: 0 },
  ]),
  series('cat-b', 'Transporte', [
    { month: '2026-01', total: 50, count: 1 },
    { month: '2026-02', total: 30, count: 1 },
  ]),
];

describe('CategoryTrendChart', () => {
  beforeEach(() => {
    for (const key of Object.keys(lineProps)) delete lineProps[key];
  });

  it('loading=true: muestra el spinner, no el gráfico', () => {
    render(
      <CategoryTrendChart
        months={MONTHS}
        series={SERIES}
        selectedCategoryIds={['cat-a']}
        loading
        emptyState={null}
        onPointClick={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });

  it('emptyState "no-data": muestra el mensaje genérico', () => {
    render(
      <CategoryTrendChart
        months={[]}
        series={[]}
        selectedCategoryIds={[]}
        loading={false}
        emptyState="no-data"
        onPointClick={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument();
  });

  it('emptyState "account-no-data": muestra el mensaje específico de cuenta', () => {
    render(
      <CategoryTrendChart
        months={[]}
        series={[]}
        selectedCategoryIds={[]}
        loading={false}
        emptyState="account-no-data"
        onPointClick={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(
      screen.getByText('Esta cuenta no tiene movimientos en el rango seleccionado')
    ).toBeInTheDocument();
  });

  it('emptyState "no-selection": muestra el mensaje de selección', () => {
    render(
      <CategoryTrendChart
        months={MONTHS}
        series={SERIES}
        selectedCategoryIds={[]}
        loading={false}
        emptyState="no-selection"
        onPointClick={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(
      screen.getByText('Selecciona al menos una categoría para ver la gráfica')
    ).toBeInTheDocument();
  });

  it('emptyState "error": muestra ErrorCard con reintento', () => {
    const onRetry = vi.fn();
    render(
      <CategoryTrendChart
        months={[]}
        series={[]}
        selectedCategoryIds={[]}
        loading={false}
        emptyState="error"
        onPointClick={vi.fn()}
        onRetry={onRetry}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renderiza una línea por categoría seleccionada, no por todas las disponibles', () => {
    render(
      <CategoryTrendChart
        months={MONTHS}
        series={SERIES}
        selectedCategoryIds={['cat-a']}
        loading={false}
        emptyState={null}
        onPointClick={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByTestId('line-cat-a')).toBeInTheDocument();
    expect(screen.queryByTestId('line-cat-b')).not.toBeInTheDocument();
  });

  it('un punto con count > 0 invoca onPointClick con categoryId, mes y count', () => {
    const onPointClick = vi.fn();
    render(
      <CategoryTrendChart
        months={MONTHS}
        series={SERIES}
        selectedCategoryIds={['cat-a']}
        loading={false}
        emptyState={null}
        onPointClick={onPointClick}
        onRetry={vi.fn()}
      />
    );

    const dot = lineProps['cat-a'].dot({
      cx: 10,
      cy: 20,
      payload: { monthKey: '2026-01', 'cat-a': 100, 'cat-a__count': 2 },
    });
    render(<svg>{dot}</svg>);

    fireEvent.click(screen.getByTestId('chart-dot-cat-a-2026-01'));
    expect(onPointClick).toHaveBeenCalledWith('cat-a', '2026-01', 2);
  });

  it('un punto con count === 0 no invoca onPointClick', () => {
    const onPointClick = vi.fn();
    render(
      <CategoryTrendChart
        months={MONTHS}
        series={SERIES}
        selectedCategoryIds={['cat-a']}
        loading={false}
        emptyState={null}
        onPointClick={onPointClick}
        onRetry={vi.fn()}
      />
    );

    const dot = lineProps['cat-a'].dot({
      cx: 10,
      cy: 20,
      payload: { monthKey: '2026-02', 'cat-a': 0, 'cat-a__count': 0 },
    });
    render(<svg>{dot}</svg>);

    fireEvent.click(screen.getByTestId('chart-dot-cat-a-2026-02'));
    expect(onPointClick).not.toHaveBeenCalled();
  });
});
