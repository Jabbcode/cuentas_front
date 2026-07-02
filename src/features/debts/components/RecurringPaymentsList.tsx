import { Calendar, Pencil, Trash2, PlayCircle, PauseCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { formatCurrency } from '../../../lib/utils';
import { getScheduleText } from '../utils';
import type { RecurringDebtPayment } from '../../../types';

export interface RecurringPaymentsListProps {
  recurringPayments: RecurringDebtPayment[];
  onEdit: (payment: RecurringDebtPayment) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

const FREQUENCY_LABELS: Record<RecurringDebtPayment['frequency'], string> = {
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
};

function formatNextDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function RecurringPaymentsList({
  recurringPayments,
  onEdit,
  onDelete,
  onToggleActive,
}: RecurringPaymentsListProps) {
  if (recurringPayments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Pagos Automaticos Configurados:</p>
      {recurringPayments.map((payment) => (
        <div
          key={payment.id}
          className={`rounded-lg border p-3 ${
            payment.isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    payment.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {payment.isActive ? 'Activo' : 'Pausado'}
                </span>
                <span className="text-xs text-gray-600">{FREQUENCY_LABELS[payment.frequency]}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-bold text-gray-900">{formatCurrency(payment.amount)}</span>
                <span className="text-gray-600">-&gt;</span>
                <span className="text-gray-700">{payment.account?.name}</span>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                <Calendar className="mr-1 inline h-3 w-3" />
                {getScheduleText(payment)}
              </p>
              {payment.nextDueDate && payment.isActive && (
                <p className="mt-1 text-xs text-blue-700">
                  Proximo pago: {formatNextDate(payment.nextDueDate)}
                </p>
              )}
              {payment.notes && (
                <p className="mt-1 text-xs italic text-gray-500">{payment.notes}</p>
              )}
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onToggleActive(payment.id, !payment.isActive)}
                title={payment.isActive ? 'Pausar' : 'Reanudar'}
              >
                {payment.isActive ? (
                  <PauseCircle className="h-4 w-4 text-amber-600" />
                ) : (
                  <PlayCircle className="h-4 w-4 text-green-600" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onEdit(payment)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onDelete(payment.id)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
