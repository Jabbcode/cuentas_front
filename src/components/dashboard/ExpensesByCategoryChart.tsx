import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { CategoryIcon } from '../ui/category-icon';
import { CategoryLimitBadge } from '../../features/categories/components/CategoryLimitBadge';
import { formatCurrency } from '../../lib/utils';
import type { CategorySummary } from '../../types';

const COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
];

interface ExpensesByCategoryChartProps {
  categories: CategorySummary[];
}

export function ExpensesByCategoryChart({ categories }: ExpensesByCategoryChartProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <CardHeader
        className="flex flex-row items-center justify-between p-4 lg:p-6 cursor-pointer select-none"
        onClick={() => setIsOpen((v) => !v)}
      >
        <CardTitle className="text-base lg:text-lg">Gastos por Categoría</CardTitle>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        )}
      </CardHeader>

      {isOpen && (
        <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
          {categories.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-gray-500 lg:h-48">
              Sin gastos este mes
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 lg:gap-6 lg:flex-row">
              <ResponsiveContainer width={140} height={140} className="lg:!w-[180px] lg:!h-[180px]">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    label={false}
                  >
                    {categories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full flex-1 space-y-1.5 lg:space-y-2">
                {categories.slice(0, 5).map((cat, index) => (
                  <div key={cat.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-2.5 w-2.5 rounded-full lg:h-3 lg:w-3"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <CategoryIcon
                        icon={cat.icon}
                        color={cat.color}
                        size="sm"
                        tooltip={cat.name}
                      />
                      <span className="text-xs text-gray-700 lg:text-sm">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-right">
                      <span className="text-xs font-medium text-gray-900 lg:text-sm">
                        {formatCurrency(cat.total)}
                      </span>
                      <span className="text-[10px] text-gray-500 lg:text-xs">
                        ({cat.percentage}%)
                      </span>
                      {cat.monthlyLimit && (
                        <CategoryLimitBadge
                          spent={cat.total}
                          limit={cat.monthlyLimit}
                          percentage={
                            cat.monthlyLimit > 0 ? (cat.total / cat.monthlyLimit) * 100 : null
                          }
                          compact
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
