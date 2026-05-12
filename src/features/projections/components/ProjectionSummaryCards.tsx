import { cn } from '../../../lib/utils';
import type { FinancialProjection } from '../types';
import { formatAmount } from '../utils';

interface ProjectionSummaryCardsProps {
  data: FinancialProjection;
}

export function ProjectionSummaryCards({ data }: ProjectionSummaryCardsProps) {
  const { currentBalance, projectedBalance, outflows, historical } = data;
  const netOutflow =
    outflows.totalExpenses + outflows.totalDebt + historical.forPeriod - outflows.totalIncome;
  const diff = projectedBalance - currentBalance;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <SummaryCard label="Balance Actual" value={currentBalance} variant="neutral" />
      <SummaryCard
        label="Balance Proyectado"
        value={projectedBalance}
        variant={projectedBalance >= 0 ? 'positive' : 'negative'}
        diff={diff}
      />
      <SummaryCard label="Salidas Estimadas" value={netOutflow} variant="negative" />
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
  variant: 'neutral' | 'positive' | 'negative';
  diff?: number;
}

function SummaryCard({ label, value, variant, diff }: SummaryCardProps) {
  const colorClass = {
    neutral: 'text-gray-900',
    positive: 'text-green-600',
    negative: 'text-red-600',
  }[variant];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={cn('mt-1 text-2xl font-bold', colorClass)}>${formatAmount(Math.abs(value))}</p>
      {diff !== undefined && (
        <p
          className={cn('mt-1 text-xs font-medium', diff >= 0 ? 'text-green-600' : 'text-red-600')}
        >
          {diff >= 0 ? '+' : '-'}${formatAmount(Math.abs(diff))} vs hoy
        </p>
      )}
    </div>
  );
}
