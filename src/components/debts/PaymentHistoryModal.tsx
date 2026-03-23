import { Dialog, DialogHeader, DialogTitle, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { formatCurrency } from '../../lib/utils';
import type { Debt } from '../../types';

interface PaymentHistoryModalProps {
  debt: Debt;
  onClose: () => void;
}

export function PaymentHistoryModal({ debt, onClose }: PaymentHistoryModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPaid = debt.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const totalPrincipal = debt.payments?.reduce((sum, p) => sum + Number(p.principal), 0) || 0;
  const totalInterest = debt.payments?.reduce((sum, p) => sum + Number(p.interest), 0) || 0;

  return (
    <Dialog open onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Historial de Pagos</DialogTitle>
      </DialogHeader>

      <DialogContent className="max-h-[70vh] overflow-y-auto">
        {/* Debt Info */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 mb-4">
          <p className="text-sm font-medium text-blue-900">{debt.creditor}</p>
          <p className="text-xs text-blue-700">{debt.description}</p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <p className="text-xs text-blue-700">Monto original</p>
              <p className="text-sm font-bold text-blue-900">{formatCurrency(Number(debt.totalAmount))}</p>
            </div>
            <div>
              <p className="text-xs text-blue-700">Restante</p>
              <p className="text-sm font-bold text-blue-900">{formatCurrency(Number(debt.remainingAmount))}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        {debt.payments && debt.payments.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 mb-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Resumen de Pagos</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-gray-600">Total pagado</p>
                <p className="font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
              </div>
              <div>
                <p className="text-gray-600">Al principal</p>
                <p className="font-bold text-blue-600">{formatCurrency(totalPrincipal)}</p>
              </div>
              <div>
                <p className="text-gray-600">Intereses</p>
                <p className="font-bold text-orange-600">{formatCurrency(totalInterest)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payments List */}
        {debt.payments && debt.payments.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-900">Pagos Realizados ({debt.payments.length})</p>
            {debt.payments?.map((payment, index) => (
              <div
                key={payment.id}
                className="rounded-lg border border-gray-200 bg-white p-3 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">
                        Pago #{(debt.payments?.length || 0) - index}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-600">
                        {formatDate(payment.paymentDate)}
                      </span>
                    </div>
                    {payment.account && (
                      <p className="text-xs text-gray-500 mt-1">
                        Cuenta: {payment.account.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(Number(payment.amount))}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Al principal</p>
                    <p className="text-sm font-semibold text-blue-600">
                      {formatCurrency(Number(payment.principal))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Interés</p>
                    <p className="text-sm font-semibold text-orange-600">
                      {formatCurrency(Number(payment.interest))}
                    </p>
                  </div>
                </div>

                {payment.notes && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Notas:</p>
                    <p className="text-xs text-gray-700 italic">{payment.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay pagos registrados para esta deuda</p>
          </div>
        )}
      </DialogContent>

      <div className="flex justify-end p-4 border-t border-gray-200">
        <Button onClick={onClose} variant="outline">
          Cerrar
        </Button>
      </div>
    </Dialog>
  );
}
