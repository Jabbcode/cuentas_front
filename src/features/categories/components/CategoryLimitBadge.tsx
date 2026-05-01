import { formatCurrency } from '../../../lib/utils';

interface CategoryLimitBadgeProps {
  spent: number;
  limit: number | null;
  percentage: number | null;
  compact?: boolean;
}

export function CategoryLimitBadge({
  spent,
  limit,
  percentage,
  compact = false,
}: CategoryLimitBadgeProps) {
  if (!limit) return null;

  const getColorClasses = () => {
    if (!percentage) return 'bg-gray-100 text-gray-700';
    if (percentage >= 100) return 'bg-red-100 text-red-700 ring-2 ring-red-500';
    if (percentage >= 90) return 'bg-red-100 text-red-700';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const getProgressColor = () => {
    if (!percentage) return 'bg-gray-300';
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 90) return 'bg-red-400';
    if (percentage >= 70) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${getColorClasses()}`}
      >
        <span>
          {formatCurrency(spent)}/{formatCurrency(limit)}
        </span>
        <span className="opacity-75">({Math.round(percentage || 0)}%)</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {formatCurrency(spent)} de {formatCurrency(limit)}
        </span>
        <span
          className={`font-medium ${percentage && percentage >= 90 ? 'text-red-600' : 'text-gray-700'}`}
        >
          {Math.round(percentage || 0)}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all ${getProgressColor()}`}
          style={{ width: `${Math.min(percentage || 0, 100)}%` }}
        />
      </div>
      {percentage && percentage >= 100 && (
        <p className="text-xs text-red-600">Límite excedido por {formatCurrency(spent - limit)}</p>
      )}
    </div>
  );
}
