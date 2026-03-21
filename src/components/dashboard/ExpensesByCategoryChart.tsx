import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { CategoryIcon } from '../ui/category-icon';
import { formatCurrency } from '../../lib/utils';
import type { CategorySummary } from '../../types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

interface ExpensesByCategoryChartProps {
  categories: CategorySummary[];
}

export function ExpensesByCategoryChart({ categories }: ExpensesByCategoryChartProps) {
  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader className="p-4 lg:p-6">
          <CardTitle className="text-base lg:text-lg">Gastos por Categoría</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
          <div className="flex h-32 items-center justify-center text-sm text-gray-500 lg:h-48">
            Sin gastos este mes
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 lg:p-6">
        <CardTitle className="text-base lg:text-lg">Gastos por Categoría</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
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
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full lg:h-3 lg:w-3"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <CategoryIcon icon={cat.icon} color={cat.color} size="sm" tooltip={cat.name} />
                  <span className="text-xs text-gray-700 lg:text-sm">{cat.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-gray-900 lg:text-sm">{formatCurrency(cat.total)}</span>
                  <span className="ml-1 text-[10px] text-gray-500 lg:ml-2 lg:text-xs">({cat.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
