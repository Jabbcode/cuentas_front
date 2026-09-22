import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent } from '../../../components/ui/card';
import { ErrorCard } from '../../../components/ui/ErrorCard';
import { formatCurrency } from '../../../lib/utils';
import { formatMonthLabel, CATEGORY_LINE_COLORS } from '../utils';
import type { AnalysisEmptyState, CategorySeries } from '../types';

interface CategoryTrendChartProps {
  months: string[];
  series: CategorySeries[];
  selectedCategoryIds: string[];
  loading: boolean;
  emptyState: AnalysisEmptyState;
  onPointClick: (categoryId: string, month: string, count: number) => void;
  onRetry: () => void;
}

const EMPTY_STATE_MESSAGES: Record<Exclude<AnalysisEmptyState, null>, string> = {
  'no-data': 'No hay datos disponibles',
  'account-no-data': 'Esta cuenta no tiene movimientos en el rango seleccionado',
  'no-selection': 'Selecciona al menos una categoría para ver la gráfica',
  error: 'No se pudo cargar la gráfica de categorías',
};

/**
 * Una fila del chart: `monthKey`/`monthLabel` fijos, más dos claves
 * sintéticas por categoría seleccionada — `[categoryId]` (total, leído por el
 * `dataKey` de cada `<Line>`) y `[categoryId]__count` (count, leído solo por
 * `makeDotRenderer` para decidir si el punto es clickeable).
 */
interface ChartRow {
  monthKey: string;
  monthLabel: string;
  [seriesKey: string]: string | number;
}

interface ChartDotProps {
  cx?: number;
  cy?: number;
  payload?: ChartRow;
}

function countKey(categoryId: string): string {
  return `${categoryId}__count`;
}

/** Un punto con `count === 0` no es clickeable (criterio 6, caso límite). */
function makeDotRenderer(categoryId: string, color: string, onClick: (month: string) => void) {
  return ({ cx, cy, payload }: ChartDotProps) => {
    if (cx == null || cy == null || !payload) return <g />;
    const count = Number(payload[countKey(categoryId)] ?? 0);
    const monthKey = payload.monthKey;
    const clickable = count > 0;

    return (
      <circle
        key={`${categoryId}-${monthKey}`}
        data-testid={`chart-dot-${categoryId}-${monthKey}`}
        cx={cx}
        cy={cy}
        r={4}
        fill={color}
        stroke="#fff"
        strokeWidth={1}
        style={{ cursor: clickable ? 'pointer' : 'default' }}
        onClick={clickable ? () => onClick(monthKey) : undefined}
      />
    );
  };
}

export function CategoryTrendChart({
  months,
  series,
  selectedCategoryIds,
  loading,
  emptyState,
  onPointClick,
  onRetry,
}: CategoryTrendChartProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 motion-safe:animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (emptyState === 'error') {
    return (
      <Card>
        <CardContent className="p-4">
          <ErrorCard message={EMPTY_STATE_MESSAGES.error} onRetry={onRetry} />
        </CardContent>
      </Card>
    );
  }

  if (emptyState) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-gray-500">{EMPTY_STATE_MESSAGES[emptyState]}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedSeries = series.filter((s) => selectedCategoryIds.includes(s.category.id));

  const chartData: ChartRow[] = months.map((month) => {
    const point: ChartRow = {
      monthKey: month,
      monthLabel: formatMonthLabel(month),
    };
    selectedSeries.forEach((s) => {
      const p = s.points.find((point) => point.month === month);
      point[s.category.id] = p?.total ?? 0;
      point[countKey(s.category.id)] = p?.count ?? 0;
    });
    return point;
  });

  return (
    <Card>
      <CardContent className="p-4">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
            <YAxis
              tickFormatter={(value: number) =>
                new Intl.NumberFormat('es-ES', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(value)
              }
              tick={{ fontSize: 11 }}
            />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            {selectedSeries.map((s, index) => {
              const color =
                s.category.color ?? CATEGORY_LINE_COLORS[index % CATEGORY_LINE_COLORS.length];
              return (
                <Line
                  key={s.category.id}
                  type="monotone"
                  dataKey={s.category.id}
                  name={s.category.name}
                  stroke={color}
                  dot={makeDotRenderer(s.category.id, color, (month) =>
                    onPointClick(
                      s.category.id,
                      month,
                      Number(
                        chartData.find((d) => d.monthKey === month)?.[countKey(s.category.id)] ?? 0
                      )
                    )
                  )}
                  activeDot={{ r: 6 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
