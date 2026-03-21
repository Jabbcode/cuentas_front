import { Link } from 'react-router-dom';
import { CalendarClock, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { formatCurrency } from '../../lib/utils';
import type { FixedExpenseSummary } from '../../types';

interface FixedExpensesSummaryCardProps {
  summary: FixedExpenseSummary;
}

export function FixedExpensesSummaryCard({ summary }: FixedExpensesSummaryCardProps) {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between lg:p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <CalendarClock className="h-4 w-4 text-blue-600 lg:h-5 lg:w-5" />
          </div>
          <div>
            <CardTitle className="text-base lg:text-lg">Gastos Fijos</CardTitle>
            <p className="text-xs text-gray-500 lg:text-sm">Pagos recurrentes</p>
          </div>
        </div>
        <Link to="/fixed-expenses">
          <Button variant="ghost" size="sm" className="w-full sm:w-auto">
            Ver todos <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
        <div className="grid grid-cols-3 gap-2 lg:gap-4">
          <div className="rounded-lg bg-gray-50 p-2 text-center lg:p-4">
            <p className="text-xs font-medium text-gray-500 lg:text-sm">Total</p>
            <p className="mt-1 text-base font-bold text-gray-900 lg:text-2xl">
              {formatCurrency(summary.totalMonthlyExpenses)}
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-2 text-center lg:p-4">
            <p className="text-xs font-medium text-gray-500 lg:text-sm">Pagados</p>
            <p className="mt-1 text-base font-bold text-green-600 lg:text-2xl">
              {summary.paidCount}/{summary.totalCount}
            </p>
          </div>
          <div className="rounded-lg bg-orange-50 p-2 text-center lg:p-4">
            <p className="text-xs font-medium text-gray-500 lg:text-sm">Pendientes</p>
            <p className="mt-1 text-base font-bold text-orange-600 lg:text-2xl">
              {summary.pendingCount}
            </p>
          </div>
        </div>

        {summary.pendingCount > 0 && (
          <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-2 lg:mt-4 lg:p-3">
            <p className="text-xs font-medium text-orange-800 lg:text-sm">
              {summary.pendingCount} gasto(s) pendiente(s) este mes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
