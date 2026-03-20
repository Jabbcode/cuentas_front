import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { formatCurrency } from '../../lib/utils';
import type { FixedExpenseSummary } from '../../types';
import { TrendingDown, TrendingUp, CheckCircle2, Clock, CalendarClock } from 'lucide-react';

interface MonthlyFixedSummaryProps {
  summary: FixedExpenseSummary;
}

export function MonthlyFixedSummary({ summary }: MonthlyFixedSummaryProps) {
  const netFixed = summary.totalMonthlyIncome - summary.totalMonthlyExpenses;
  const progressPercentage = summary.totalCount > 0
    ? Math.round((summary.paidCount / summary.totalCount) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <CalendarClock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle>Resumen del Mes</CardTitle>
            <p className="text-sm text-gray-500">Control de gastos e ingresos fijos</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Gastos Fijos */}
          <div className="rounded-xl bg-red-50 p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-700">Gastos Fijos</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalMonthlyExpenses)}
            </p>
            <p className="text-xs text-red-500">por mes</p>
          </div>

          {/* Total Ingresos Fijos */}
          <div className="rounded-xl bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-700">Ingresos Fijos</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalMonthlyIncome)}
            </p>
            <p className="text-xs text-green-500">por mes</p>
          </div>

          {/* Balance Neto Fijo */}
          <div className={`rounded-xl p-4 ${netFixed >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <span className={`text-sm font-medium ${netFixed >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              Balance Fijo Neto
            </span>
            <p className={`mt-2 text-2xl font-bold ${netFixed >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatCurrency(netFixed)}
            </p>
            <p className={`text-xs ${netFixed >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
              {netFixed >= 0 ? 'superávit mensual' : 'déficit mensual'}
            </p>
          </div>

          {/* Progreso de Pagos */}
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Progreso</span>
              <span className="text-sm font-bold text-gray-900">
                {summary.paidCount}/{summary.totalCount}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {summary.paidCount} pagados
              </span>
              <span className="flex items-center gap-1 text-orange-600">
                <Clock className="h-3.5 w-3.5" />
                {summary.pendingCount} pendientes
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
