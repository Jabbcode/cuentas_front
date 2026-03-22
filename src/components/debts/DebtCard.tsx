import { AlertCircle, Calendar, TrendingUp, MoreVertical, Pencil, Trash2, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { formatCurrency, cn } from '../../lib/utils';
import type { Debt } from '../../types';
import { useState } from 'react';

interface DebtCardProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => void;
  onPay: (debt: Debt) => void;
}

export function DebtCard({ debt, onEdit, onDelete, onPay }: DebtCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const totalAmount = Number(debt.totalAmount);
  const remainingAmount = Number(debt.remainingAmount);
  const progressPercentage = ((totalAmount - remainingAmount) / totalAmount) * 100;
  const isPaid = debt.status === 'paid';
  const isOverdue = debt.status === 'overdue';

  const getStatusColor = () => {
    if (isPaid) return 'bg-green-100 text-green-700 border-green-200';
    if (isOverdue) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getStatusText = () => {
    if (isPaid) return 'Pagada';
    if (isOverdue) return 'Vencida';
    return 'Activa';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', isOverdue && 'border-red-300')}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{debt.creditor}</h3>
              <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full border', getStatusColor())}>
                {getStatusText()}
              </span>
            </div>
            <p className="text-sm text-gray-600">{debt.description}</p>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-32 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                  <button
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(debt);
                    }}
                  >
                    <Pencil className="h-4 w-4" /> Editar
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(debt.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Monto total</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(debt.totalAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Restante</p>
            <p className={cn('text-lg font-bold', isPaid ? 'text-green-600' : 'text-red-600')}>
              {formatCurrency(debt.remainingAmount)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {!isPaid && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Progreso de pago</span>
              <span className="font-medium text-gray-900">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Info Row */}
        <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
          {debt.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Vence: {formatDate(debt.dueDate)}</span>
            </div>
          )}
          {debt.interestRate && debt.interestType && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>
                Interés: {debt.interestRate}{debt.interestType === 'percentage' ? '%' : '€'}
              </span>
            </div>
          )}
        </div>

        {/* Overdue Alert */}
        {isOverdue && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-2 mb-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Esta deuda está vencida</span>
          </div>
        )}

        {/* Action Button */}
        {!isPaid && (
          <Button onClick={() => onPay(debt)} className="w-full" size="sm">
            <DollarSign className="mr-2 h-4 w-4" />
            Realizar Pago
          </Button>
        )}

        {/* Payment Count */}
        {debt._count && debt._count.payments > 0 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            {debt._count.payments} pago{debt._count.payments !== 1 ? 's' : ''} realizado{debt._count.payments !== 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
