import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { formatCurrency } from '../../lib/utils';
import type { DashboardSummary } from '../../types';

interface DashboardSummaryCardsProps {
  summary: DashboardSummary | null;
}

export function DashboardSummaryCards({ summary }: DashboardSummaryCardsProps) {
  const monthlyNet = summary?.monthlyNet || 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 lg:p-6 lg:pb-2">
          <CardTitle className="text-xs font-medium text-gray-500 lg:text-sm">
            Balance Total
          </CardTitle>
          <div className="rounded-full bg-blue-100 p-1.5 lg:p-2">
            <Wallet className="h-3 w-3 text-blue-600 lg:h-4 lg:w-4" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
          <div className="text-lg font-bold text-gray-900 lg:text-2xl">
            {formatCurrency(summary?.totalBalance || 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 lg:p-6 lg:pb-2">
          <CardTitle className="text-xs font-medium text-gray-500 lg:text-sm">
            Ingresos
          </CardTitle>
          <div className="rounded-full bg-green-100 p-1.5 lg:p-2">
            <TrendingUp className="h-3 w-3 text-green-600 lg:h-4 lg:w-4" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
          <div className="text-lg font-bold text-green-600 lg:text-2xl">
            +{formatCurrency(summary?.monthlyIncome || 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 lg:p-6 lg:pb-2">
          <CardTitle className="text-xs font-medium text-gray-500 lg:text-sm">
            Gastos
          </CardTitle>
          <div className="rounded-full bg-red-100 p-1.5 lg:p-2">
            <TrendingDown className="h-3 w-3 text-red-600 lg:h-4 lg:w-4" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
          <div className="text-lg font-bold text-red-600 lg:text-2xl">
            -{formatCurrency(summary?.monthlyExpenses || 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 lg:p-6 lg:pb-2">
          <CardTitle className="text-xs font-medium text-gray-500 lg:text-sm">
            Balance Neto
          </CardTitle>
          <div className={`rounded-full p-1.5 lg:p-2 ${monthlyNet >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            {monthlyNet >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600 lg:h-4 lg:w-4" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 lg:h-4 lg:w-4" />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
          <div
            className={`text-lg font-bold lg:text-2xl ${
              monthlyNet >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(monthlyNet)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
