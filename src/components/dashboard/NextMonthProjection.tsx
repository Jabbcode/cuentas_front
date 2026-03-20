import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { CategoryIcon } from '../ui/category-icon';
import { formatCurrency } from '../../lib/utils';
import type { ProjectionData } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface NextMonthProjectionProps {
  projection: ProjectionData;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export function NextMonthProjection({ projection }: NextMonthProjectionProps) {
  const monthName = new Date(projection.month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const expenseData = projection.expensesByCategory.map(cat => ({
    name: cat.categoryName,
    value: cat.total,
    icon: cat.categoryIcon,
    color: cat.categoryColor,
  }));

  const incomeData = projection.incomesByCategory.map(cat => ({
    name: cat.categoryName,
    value: cat.total,
    icon: cat.categoryIcon,
    color: cat.categoryColor,
  }));

  const getPercentageColor = (percentage: number) => {
    if (percentage > 0) return 'text-red-600';
    if (percentage < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getPercentageIcon = (percentage: number) => {
    if (percentage > 0) return <TrendingUp className="h-3 w-3" />;
    if (percentage < 0) return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between lg:p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-100 p-2">
            <Calendar className="h-4 w-4 text-purple-600 lg:h-5 lg:w-5" />
          </div>
          <div>
            <CardTitle className="text-base lg:text-lg">Proyección {monthName}</CardTitle>
            <p className="text-xs text-gray-500 lg:text-sm">Basado en gastos e ingresos fijos activos</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0 space-y-4 lg:space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2 lg:gap-4">
          <div className="rounded-lg bg-green-50 p-2 lg:p-4">
            <p className="text-xs font-medium text-gray-500 lg:text-sm">Ingresos</p>
            <p className="mt-1 text-sm font-bold text-green-600 lg:text-xl">
              {formatCurrency(projection.totalIncome)}
            </p>
            <div className={`flex items-center gap-1 mt-1 text-[10px] lg:text-xs ${getPercentageColor(projection.comparison.incomePercentage)}`}>
              {getPercentageIcon(projection.comparison.incomePercentage)}
              <span>{Math.abs(projection.comparison.incomePercentage)}%</span>
            </div>
          </div>

          <div className="rounded-lg bg-red-50 p-2 lg:p-4">
            <p className="text-xs font-medium text-gray-500 lg:text-sm">Gastos</p>
            <p className="mt-1 text-sm font-bold text-red-600 lg:text-xl">
              {formatCurrency(projection.totalExpenses)}
            </p>
            <div className={`flex items-center gap-1 mt-1 text-[10px] lg:text-xs ${getPercentageColor(projection.comparison.expensesPercentage)}`}>
              {getPercentageIcon(projection.comparison.expensesPercentage)}
              <span>{Math.abs(projection.comparison.expensesPercentage)}%</span>
            </div>
          </div>

          <div className={`rounded-lg p-2 lg:p-4 ${projection.netBalance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <p className="text-xs font-medium text-gray-500 lg:text-sm">Balance</p>
            <p className={`mt-1 text-sm font-bold lg:text-xl ${projection.netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatCurrency(projection.netBalance)}
            </p>
            <div className={`flex items-center gap-1 mt-1 text-[10px] lg:text-xs ${getPercentageColor(projection.comparison.netDiff > 0 ? -1 : 1)}`}>
              {projection.comparison.netDiff > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : projection.comparison.netDiff < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              <span>{formatCurrency(Math.abs(projection.comparison.netDiff))}</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
          {/* Expense Categories */}
          {expenseData.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Gastos por Categoría</h4>
              <div className="flex flex-col items-center gap-3 lg:gap-4">
                <ResponsiveContainer width={120} height={120} className="lg:!w-[140px] lg:!h-[140px]">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      label={false}
                    >
                      {expenseData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full space-y-1.5">
                  {expenseData.map((cat, index) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs lg:text-sm">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-2 w-2 rounded-full lg:h-2.5 lg:w-2.5"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />
                        <span className="text-gray-700">{cat.name}</span>
                      </div>
                      <span className="font-medium text-gray-900">{formatCurrency(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Income Categories */}
          {incomeData.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Ingresos por Categoría</h4>
              <div className="flex flex-col items-center gap-3 lg:gap-4">
                <ResponsiveContainer width={120} height={120} className="lg:!w-[140px] lg:!h-[140px]">
                  <PieChart>
                    <Pie
                      data={incomeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      label={false}
                    >
                      {incomeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full space-y-1.5">
                  {incomeData.map((cat, index) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs lg:text-sm">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-2 w-2 rounded-full lg:h-2.5 lg:w-2.5"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />
                        <span className="text-gray-700">{cat.name}</span>
                      </div>
                      <span className="font-medium text-gray-900">{formatCurrency(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Items */}
        <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
          {/* Expense Items */}
          {projection.expensesByCategory.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Desglose de Gastos</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {projection.expensesByCategory.map((category) => (
                  <div key={category.categoryId} className="border rounded-lg p-2">
                    <div className="flex items-center gap-2 mb-2">
                      <CategoryIcon icon={category.categoryIcon} color={category.categoryColor} size="sm" />
                      <span className="text-xs font-medium text-gray-700">{category.categoryName}</span>
                      <span className="ml-auto text-xs font-bold text-gray-900">
                        {formatCurrency(category.total)}
                      </span>
                    </div>
                    <div className="space-y-1 pl-6">
                      {category.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-[10px] lg:text-xs text-gray-600">
                          <span>{item.name} (día {item.dueDay})</span>
                          <span>{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Income Items */}
          {projection.incomesByCategory.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Desglose de Ingresos</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {projection.incomesByCategory.map((category) => (
                  <div key={category.categoryId} className="border rounded-lg p-2">
                    <div className="flex items-center gap-2 mb-2">
                      <CategoryIcon icon={category.categoryIcon} color={category.categoryColor} size="sm" />
                      <span className="text-xs font-medium text-gray-700">{category.categoryName}</span>
                      <span className="ml-auto text-xs font-bold text-gray-900">
                        {formatCurrency(category.total)}
                      </span>
                    </div>
                    <div className="space-y-1 pl-6">
                      {category.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-[10px] lg:text-xs text-gray-600">
                          <span>{item.name} (día {item.dueDay})</span>
                          <span>{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
