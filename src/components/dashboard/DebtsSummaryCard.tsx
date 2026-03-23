import { Receipt, AlertCircle, TrendingDown, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { formatCurrency, cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import type { DebtsSummary } from '../../types';

interface DebtsSummaryCardProps {
  summary: DebtsSummary;
}

export function DebtsSummaryCard({ summary }: DebtsSummaryCardProps) {
  const hasDebts = summary.totalActiveDebts > 0 || summary.totalOverdueDebts > 0;
  const hasOverdue = summary.totalOverdueDebts > 0;
  const hasDueSoon = summary.debtsDueSoon > 0;

  if (!hasDebts) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <Receipt className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-green-900">
                Sin Deudas Activas
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-700">
            ¡Excelente! No tienes deudas pendientes en este momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('transition-all', hasOverdue && 'border-red-200 bg-red-50')}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'rounded-full p-2',
              hasOverdue ? 'bg-red-100' : 'bg-orange-100'
            )}>
              <Receipt className={cn(
                'h-5 w-5',
                hasOverdue ? 'text-red-600' : 'text-orange-600'
              )} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Resumen de Deudas
              </CardTitle>
              <p className="text-sm text-gray-600 mt-0.5">
                {summary.totalActiveDebts + summary.totalOverdueDebts} deuda{(summary.totalActiveDebts + summary.totalOverdueDebts) !== 1 ? 's' : ''} pendiente{(summary.totalActiveDebts + summary.totalOverdueDebts) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Link to="/debts">
            <Button variant="outline" size="sm">
              Ver todas
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Total Debt Amount */}
        <div className="rounded-lg bg-white border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Adeudado</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(Number(summary.totalDebtAmount))}
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <TrendingDown className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-2">
          {/* Overdue Alert */}
          {hasOverdue && (
            <div className="flex items-start gap-2 rounded-lg bg-red-100 border border-red-200 p-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">
                  {summary.totalOverdueDebts} deuda{summary.totalOverdueDebts !== 1 ? 's' : ''} vencida{summary.totalOverdueDebts !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-red-700 mt-0.5">
                  Monto vencido: {formatCurrency(Number(summary.totalOverdueAmount))}
                </p>
              </div>
            </div>
          )}

          {/* Due Soon Alert */}
          {hasDueSoon && (
            <div className="flex items-start gap-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
              <Calendar className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  {summary.debtsDueSoon} deuda{summary.debtsDueSoon !== 1 ? 's' : ''} próxima{summary.debtsDueSoon !== 1 ? 's' : ''} a vencer
                </p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  Vencen en los próximos 7 días
                </p>
              </div>
            </div>
          )}

          {/* Active Debts (only if no alerts) */}
          {!hasOverdue && !hasDueSoon && summary.totalActiveDebts > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3">
              <Receipt className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  {summary.totalActiveDebts} deuda{summary.totalActiveDebts !== 1 ? 's' : ''} activa{summary.totalActiveDebts !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Sin pagos vencidos ni próximos a vencer
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Debts List */}
        {summary.upcomingDebts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Próximas a vencer:</p>
            {summary.upcomingDebts.slice(0, 3).map((debt) => (
              <div
                key={debt.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2.5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {debt.creditor}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {debt.description}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(debt.remainingAmount)}
                  </p>
                  {debt.dueDate && (
                    <p className="text-xs text-gray-500">
                      {new Date(debt.dueDate).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {summary.upcomingDebts.length > 3 && (
              <Link to="/debts">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  Ver {summary.upcomingDebts.length - 3} más
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
