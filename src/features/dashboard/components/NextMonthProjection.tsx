import { TrendingUp, TrendingDown, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { CategoryIcon } from '../../../components/ui/category-icon';
import { formatCurrency } from '../../../lib/utils';
import type { ProjectionData } from '../../../types';

interface NextMonthProjectionProps {
  projection: ProjectionData;
  isOpen: boolean;
  onToggle: () => void;
}

function getPercentageColor(percentage: number): string {
  if (percentage > 0) return 'text-red-600';
  if (percentage < 0) return 'text-green-600';
  return 'text-gray-600';
}

function getPercentageIcon(percentage: number) {
  if (percentage > 0) return <TrendingUp className="h-3 w-3" />;
  if (percentage < 0) return <TrendingDown className="h-3 w-3" />;
  return null;
}

export function NextMonthProjection({ projection, isOpen, onToggle }: NextMonthProjectionProps) {
  const monthName = new Date(projection.month).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card>
      <CardHeader
        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between lg:p-6 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-50 p-2">
            <Calendar className="h-4 w-4 text-blue-600 lg:h-5 lg:w-5" />
          </div>
          <div>
            <CardTitle className="text-base lg:text-lg">Proyección {monthName}</CardTitle>
            <p className="text-xs text-gray-500 lg:text-sm">
              Basado en gastos e ingresos fijos activos
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </CardHeader>

      {isOpen && (
        <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0 space-y-4 lg:space-y-6">
          {/* Resumen */}
          <div className="grid grid-cols-3 gap-2 lg:gap-4">
            <div className="rounded-lg bg-green-50 p-2 lg:p-4">
              <p className="text-xs font-medium text-green-800 lg:text-sm">Ingresos</p>
              <p className="mt-1 text-sm font-bold text-green-600 lg:text-xl">
                {formatCurrency(projection.totalIncome)}
              </p>
              <div
                className={`flex items-center gap-1 mt-1 text-[10px] lg:text-xs ${getPercentageColor(projection.comparison.incomePercentage)}`}
              >
                {getPercentageIcon(projection.comparison.incomePercentage)}
                <span>{Math.abs(projection.comparison.incomePercentage)}%</span>
              </div>
            </div>

            <div className="rounded-lg bg-red-50 p-2 lg:p-4">
              <p className="text-xs font-medium text-red-800 lg:text-sm">Gastos</p>
              <p className="mt-1 text-sm font-bold text-red-600 lg:text-xl">
                {formatCurrency(projection.totalExpenses)}
              </p>
              <div
                className={`flex items-center gap-1 mt-1 text-[10px] lg:text-xs ${getPercentageColor(projection.comparison.expensesPercentage)}`}
              >
                {getPercentageIcon(projection.comparison.expensesPercentage)}
                <span>{Math.abs(projection.comparison.expensesPercentage)}%</span>
              </div>
            </div>

            <div
              className={`rounded-lg p-2 lg:p-4 ${projection.netBalance >= 0 ? 'bg-green-50' : 'bg-amber-50'}`}
            >
              <p
                className={`text-xs font-medium lg:text-sm ${projection.netBalance >= 0 ? 'text-green-800' : 'text-amber-800'}`}
              >
                Balance
              </p>
              <p
                className={`mt-1 text-sm font-bold lg:text-xl ${projection.netBalance >= 0 ? 'text-green-600' : 'text-amber-600'}`}
              >
                {formatCurrency(projection.netBalance)}
              </p>
              <div
                className={`flex items-center gap-1 mt-1 text-[10px] lg:text-xs ${getPercentageColor(projection.comparison.netDiff > 0 ? -1 : 1)}`}
              >
                {projection.comparison.netDiff > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : projection.comparison.netDiff < 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : null}
                <span>{formatCurrency(Math.abs(projection.comparison.netDiff))}</span>
              </div>
            </div>
          </div>

          {/* Desglose */}
          <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
            {projection.expensesByCategory.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Desglose de Gastos</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {projection.expensesByCategory.map((category) => (
                    <div key={category.categoryId} className="border rounded-lg p-2">
                      <div className="flex items-center gap-2 mb-2">
                        <CategoryIcon
                          icon={category.categoryIcon}
                          color={category.categoryColor}
                          size="sm"
                        />
                        <span className="text-xs font-medium text-gray-700">
                          {category.categoryName}
                        </span>
                        <span className="ml-auto text-xs font-bold text-gray-900">
                          {formatCurrency(category.total)}
                        </span>
                      </div>
                      <div className="space-y-1 pl-6">
                        {category.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-[10px] lg:text-xs text-gray-600"
                          >
                            <span>
                              {item.name} (día {item.dueDay})
                            </span>
                            <span>{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projection.incomesByCategory.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Desglose de Ingresos</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {projection.incomesByCategory.map((category) => (
                    <div key={category.categoryId} className="border rounded-lg p-2">
                      <div className="flex items-center gap-2 mb-2">
                        <CategoryIcon
                          icon={category.categoryIcon}
                          color={category.categoryColor}
                          size="sm"
                        />
                        <span className="text-xs font-medium text-gray-700">
                          {category.categoryName}
                        </span>
                        <span className="ml-auto text-xs font-bold text-gray-900">
                          {formatCurrency(category.total)}
                        </span>
                      </div>
                      <div className="space-y-1 pl-6">
                        {category.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-[10px] lg:text-xs text-gray-600"
                          >
                            <span>
                              {item.name} (día {item.dueDay})
                            </span>
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
      )}
    </Card>
  );
}
