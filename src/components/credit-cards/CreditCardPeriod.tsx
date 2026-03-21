import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import { getDaysColor } from '../../lib/credit-card-utils';

interface ClosedPeriodData {
  startDate: string;
  endDate: string;
  balance: number;
  transactions: any[];
  isPaid: boolean;
  paymentDueDate: string;
  daysUntilDue: number;
}

interface CurrentPeriodData {
  startDate: string;
  endDate: string;
  balance: number;
  transactions: any[];
  daysUntilCutoff: number;
}

interface CreditCardPeriodProps {
  type: 'closed' | 'current';
  period: ClosedPeriodData | CurrentPeriodData;
  onPayClick?: () => void;
}

export function CreditCardPeriod({ type, period, onPayClick }: CreditCardPeriodProps) {
  const isClosed = type === 'closed';
  const closedPeriod = period as ClosedPeriodData;
  const currentPeriod = period as CurrentPeriodData;

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">
          {isClosed ? 'A Pagar' : 'Período Actual'}
        </h4>
        {isClosed && closedPeriod.isPaid && (
          <Badge variant="success">Pagado</Badge>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Período:</span>
          <span className="font-medium">
            {formatDate(period.startDate)} - {formatDate(period.endDate)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">
            {isClosed ? 'Monto:' : 'Acumulado:'}
          </span>
          <span
            className={`text-lg font-bold ${
              isClosed
                ? period.balance === 0
                  ? 'text-gray-400'
                  : 'text-red-600'
                : 'text-orange-600'
            }`}
          >
            {isClosed && period.balance === 0
              ? 'Sin saldo'
              : formatCurrency(period.balance)}
          </span>
        </div>

        {isClosed ? (
          <div className="flex justify-between">
            <span className="text-gray-600">Vencimiento:</span>
            <span
              className={`font-medium ${getDaysColor(
                closedPeriod.daysUntilDue,
                closedPeriod.balance
              )}`}
            >
              {formatDate(closedPeriod.paymentDueDate)}
              {closedPeriod.balance > 0 && (
                <span className="text-xs ml-1">
                  (
                  {closedPeriod.daysUntilDue === 0
                    ? 'hoy'
                    : closedPeriod.daysUntilDue === 1
                    ? 'mañana'
                    : closedPeriod.daysUntilDue < 0
                    ? `vencido`
                    : `${closedPeriod.daysUntilDue}d`}
                  )
                </span>
              )}
            </span>
          </div>
        ) : (
          <div className="flex justify-between">
            <span className="text-gray-600">Cierra en:</span>
            <span className="font-medium">
              {currentPeriod.daysUntilCutoff} día
              {currentPeriod.daysUntilCutoff !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">Transacciones:</span>
          <span>{period.transactions.length}</span>
        </div>
      </div>

      {isClosed && !closedPeriod.isPaid && onPayClick && (
        <Button
          onClick={onPayClick}
          disabled={closedPeriod.balance === 0}
          className="w-full mt-3"
        >
          Pagar{' '}
          {closedPeriod.balance > 0 && formatCurrency(closedPeriod.balance)}
        </Button>
      )}
    </div>
  );
}
