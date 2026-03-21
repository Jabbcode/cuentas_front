import { AlertCircle, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { formatCurrency } from '../../lib/utils';
import type { CreditCardStatement } from '../../types';

interface CreditCardSummaryProps {
  statements: CreditCardStatement[];
}

export function CreditCardSummary({ statements }: CreditCardSummaryProps) {
  const totalToPay = statements.reduce(
    (sum, s) => sum + (s.closedPeriod.isPaid ? 0 : s.closedPeriod.balance),
    0
  );

  const pendingCards = statements.filter((s) => !s.closedPeriod.isPaid).length;

  const currentPeriodTotal = statements.reduce(
    (sum, s) => sum + s.currentPeriod.balance,
    0
  );

  const totalUsed = statements.reduce(
    (sum, s) =>
      sum +
      s.currentPeriod.balance +
      (s.closedPeriod.isPaid ? 0 : s.closedPeriod.balance),
    0
  );

  return (
    <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
      {/* Total a Pagar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 lg:p-6 lg:pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Total a Pagar
          </CardTitle>
          <div className="rounded-full bg-red-100 p-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalToPay)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {pendingCards} tarjeta(s) pendiente(s)
          </p>
        </CardContent>
      </Card>

      {/* Período Actual */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 lg:p-6 lg:pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Período Actual
          </CardTitle>
          <div className="rounded-full bg-orange-100 p-2">
            <Calendar className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(currentPeriodTotal)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Acumulado este período</p>
        </CardContent>
      </Card>

      {/* Total Usado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 lg:p-6 lg:pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Total Usado
          </CardTitle>
          <div className="rounded-full bg-purple-100 p-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(totalUsed)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Entre {statements.length} tarjeta(s)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
