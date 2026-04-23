import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import type { CategoryComparison } from '../../types';
import { CategoryIcon } from '../ui/category-icon';
import { MONTHS_SHORT, formatCurrency } from '../../lib/utils';

interface Props {
  categories: CategoryComparison[];
  previousMonth: number;
  previousYear: number;
  currentMonth: number;
  currentYear: number;
}

export function CategoryComparisonChart({
  categories,
  previousMonth,
  previousYear,
  currentMonth,
  currentYear,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const prevLabel = `${MONTHS_SHORT[previousMonth - 1]} ${previousYear}`;
  const currLabel = `${MONTHS_SHORT[currentMonth - 1]} ${currentYear}`;

  const chartData = categories.slice(0, 8).map((cat) => ({
    name: cat.name.length > 10 ? `${cat.name.slice(0, 9)}…` : cat.name,
    Anterior: cat.previous,
    Actual: cat.current,
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between p-4 text-left lg:p-6"
      >
        <h2 className="text-base font-semibold text-gray-900 lg:text-lg">Gastos por categoría</h2>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 lg:px-6 lg:pb-6">
          {chartData.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">Sin datos para este período</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(v: number) => `${v}€`}
                    tick={{ fontSize: 11 }}
                    width={50}
                  />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="Anterior" name={prevLabel} fill="#94a3b8" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Actual" name={currLabel} fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {categories.slice(0, 6).map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(cat.current)}
                      </span>
                      {cat.trend === 'up' ? (
                        <span className="flex items-center gap-0.5 text-xs text-red-500">
                          <TrendingUp className="h-3 w-3" />
                          {cat.diffPercentage !== null ? `+${cat.diffPercentage}%` : ''}
                        </span>
                      ) : cat.trend === 'down' ? (
                        <span className="flex items-center gap-0.5 text-xs text-green-600">
                          <TrendingDown className="h-3 w-3" />
                          {cat.diffPercentage !== null ? `${cat.diffPercentage}%` : ''}
                        </span>
                      ) : (
                        <Minus className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
