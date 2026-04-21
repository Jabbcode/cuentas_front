import { formatCurrency, cn } from '../../lib/utils';

interface Props {
  spent: number;
  amount: number;
  percentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

export function BudgetProgressBar({ spent, amount, percentage, isOverBudget, isNearLimit }: Props) {
  const barColor = isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500';
  const clampedPct = Math.min(percentage, 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-600">
        <span>{formatCurrency(spent)} gastado</span>
        <span className={cn(isOverBudget && 'font-medium text-red-600')}>
          {percentage.toFixed(0)}% de {formatCurrency(amount)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${clampedPct}%` }}
        />
      </div>
      {isOverBudget && (
        <p className="text-xs text-red-600">Excedido en {formatCurrency(spent - amount)}</p>
      )}
    </div>
  );
}
