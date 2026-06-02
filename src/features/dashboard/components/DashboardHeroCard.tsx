import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { formatCurrency, cn } from '../../../lib/utils';
import { calcDaysLeftInMonth, calcSpentPercentage } from '../utils';
import type { DashboardSummary } from '../../../types';

interface DashboardHeroCardProps {
  summary: DashboardSummary | null;
}

export function DashboardHeroCard({ summary }: DashboardHeroCardProps) {
  const monthlyNet = summary?.monthlyNet ?? 0;
  const monthlyIncome = summary?.monthlyIncome ?? 0;
  const monthlyExpenses = summary?.monthlyExpenses ?? 0;
  const isPositive = monthlyNet >= 0;

  const daysLeft = calcDaysLeftInMonth();
  const spentPercentage = calcSpentPercentage(monthlyExpenses, monthlyIncome);
  const cappedPercentage = Math.min(spentPercentage, 100);

  return (
    <Card className={cn('border-l-4', isPositive ? 'border-l-green-500' : 'border-l-red-500')}>
      <CardContent className="p-4 lg:p-6">
        <div className="flex flex-col gap-4">
          {/* Balance neto grande */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Balance neto del mes</p>
              <p
                className={cn(
                  'text-3xl font-bold lg:text-4xl mt-1',
                  isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {formatCurrency(monthlyNet)}
              </p>
            </div>
            <div className={cn('rounded-full p-3', isPositive ? 'bg-green-100' : 'bg-red-100')}>
              {isPositive ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>

          {/* Progress bar % gastado */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Gastado del mes</span>
              <span className="font-medium text-gray-700">{spentPercentage.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className={cn(
                  'h-2 rounded-full transition-all',
                  spentPercentage > 100
                    ? 'bg-red-500'
                    : spentPercentage > 80
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                )}
                style={{ width: `${cappedPercentage}%` }}
              />
            </div>
          </div>

          {/* Ingresos / Gastos / Días restantes */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-xs text-gray-500">Ingresos</p>
              <p className="mt-1 text-sm font-bold text-green-600 lg:text-base">
                {formatCurrency(monthlyIncome)}
              </p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-xs text-gray-500">Gastos</p>
              <p className="mt-1 text-sm font-bold text-red-600 lg:text-base">
                {formatCurrency(monthlyExpenses)}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>Días restantes</span>
              </div>
              <p className="mt-1 text-sm font-bold text-blue-600 lg:text-base">{daysLeft}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
