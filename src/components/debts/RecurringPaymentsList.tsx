import { Calendar, Pencil, Trash2, PlayCircle, PauseCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { formatCurrency } from '../../lib/utils';
import type { RecurringDebtPayment } from '../../types';

interface RecurringPaymentsListProps {
  recurringPayments: RecurringDebtPayment[];
  onEdit: (payment: RecurringDebtPayment) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

const FREQUENCY_LABELS = {
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
};

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function RecurringPaymentsList({
  recurringPayments,
  onEdit,
  onDelete,
  onToggleActive,
}: RecurringPaymentsListProps) {
  if (recurringPayments.length === 0) {
    return null;
  }

  const getScheduleText = (payment: RecurringDebtPayment) => {
    if (payment.frequency === 'monthly') {
      return `Día ${payment.dayOfMonth} de cada mes`;
    } else if (payment.frequency === 'weekly') {
      return `Cada ${DAYS_OF_WEEK[payment.dayOfWeek || 0]}`;
    } else {
      return 'Cada 14 días';
    }
  };

  const formatNextDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">⚙️ Pagos Automáticos Configurados:</p>
      {recurringPayments.map((payment) => (
        <div
          key={payment.id}
          className={`rounded-lg border ${
            payment.isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
          } p-3`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    payment.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {payment.isActive ? '✓ Activo' : '⏸ Pausado'}
                </span>
                <span className="text-xs text-gray-600">
                  {FREQUENCY_LABELS[payment.frequency]}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-bold text-gray-900">
                  {formatCurrency(payment.amount)}
                </span>
                <span className="text-gray-600">→</span>
                <span className="text-gray-700">{payment.account?.name}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                <Calendar className="h-3 w-3 inline mr-1" />
                {getScheduleText(payment)}
              </p>
              {payment.nextDueDate && payment.isActive && (
                <p className="text-xs text-blue-700 mt-1">
                  Próximo pago: {formatNextDate(payment.nextDueDate)}
                </p>
              )}
              {payment.notes && (
                <p className="text-xs text-gray-500 mt-1 italic">{payment.notes}</p>
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
                  <PauseCircle className="h-4 w-4 text-orange-600" />
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
