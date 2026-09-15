import { Button } from '../../../components/ui/button';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { getOverdueSeverity } from '../../../lib/credit-card-utils';
import type { CreditCardOverduePeriod } from '../../../types';

interface CreditCardOverduePeriodItemProps {
  period: CreditCardOverduePeriod;
  onPayClick: (period: CreditCardOverduePeriod) => void;
}

const SEVERITY_CLASSES: Record<'warning' | 'error', string> = {
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  error: 'border-red-200 bg-red-50 text-red-800',
};

export function CreditCardOverduePeriodItem({
  period,
  onPayClick,
}: CreditCardOverduePeriodItemProps) {
  const severity = getOverdueSeverity(period.daysOverdue);

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${SEVERITY_CLASSES[severity]}`}
    >
      <div className="text-sm">
        <p className="font-medium">
          {formatDate(period.startDate)} - {formatDate(period.endDate)}
        </p>
        <p className="text-xs">
          {period.transactionCount}{' '}
          {period.transactionCount === 1 ? 'transacción' : 'transacciones'} · venció hace{' '}
          {period.daysOverdue} día{period.daysOverdue !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-bold">{formatCurrency(period.balance)}</span>
        <Button size="sm" onClick={() => onPayClick(period)}>
          Pagar
        </Button>
      </div>
    </div>
  );
}
