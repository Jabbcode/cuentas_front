import { Card, CardContent } from '../../../components/ui/card';
import { formatCurrency } from '../../../lib/utils';
import type { DashboardSummary } from '../../../types';

interface DashboardSummaryCardsProps {
  summary: DashboardSummary | null;
}

export function DashboardSummaryCards({ summary }: DashboardSummaryCardsProps) {
  return (
    <Card>
      <CardContent className="flex items-baseline justify-between gap-4 p-4 lg:p-6">
        <p className="text-sm font-medium text-gray-500">Balance total en cuentas</p>
        <p className="text-lg font-semibold tabular-nums text-gray-900 lg:text-xl">
          {formatCurrency(summary?.totalBalance ?? 0)}
        </p>
      </CardContent>
    </Card>
  );
}
