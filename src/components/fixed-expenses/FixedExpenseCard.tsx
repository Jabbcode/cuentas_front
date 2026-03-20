import { useState } from 'react';
import {
  Calendar,
  Check,
  MoreVertical,
  Pencil,
  Trash2,
  Power,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../ui/dialog';
import { formatCurrency, getDaysUntilDue, isDueSoon, isOverdue } from '../../lib/utils';
import type { FixedExpense } from '../../types';
import { cn } from '../../lib/utils';

interface FixedExpenseCardProps {
  item: FixedExpense & { isPaidThisMonth: boolean };
  onPay: (id: string, amount?: number) => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export function FixedExpenseCard({
  item,
  onPay,
  onEdit,
  onDelete,
  onToggleActive,
}: FixedExpenseCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [payAmount, setPayAmount] = useState(item.amount.toString());

  const daysUntil = getDaysUntilDue(item.dueDay);
  const dueSoon = isDueSoon(item.dueDay) && !item.isPaidThisMonth;
  const overdue = isOverdue(item.dueDay) && !item.isPaidThisMonth;

  const handlePay = () => {
    const amount = parseFloat(payAmount);
    if (amount !== item.amount) {
      onPay(item.id, amount);
    } else {
      onPay(item.id);
    }
    setShowPayDialog(false);
  };

  return (
    <>
      <Card
        className={cn(
          'transition-all hover:shadow-md',
          !item.isActive && 'opacity-60',
          item.isPaidThisMonth && 'border-green-200 bg-green-50/30',
          overdue && !item.isPaidThisMonth && 'border-red-200 bg-red-50/30',
          dueSoon && !overdue && !item.isPaidThisMonth && 'border-orange-200 bg-orange-50/30'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {/* Category Icon */}
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
                style={{ backgroundColor: item.category?.color || '#e5e7eb' }}
              >
                {item.category?.icon || '📋'}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {!item.isActive && (
                    <Badge variant="secondary">Pausado</Badge>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Día {item.dueDay}
                  </span>
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5" />
                    {item.account?.name}
                  </span>
                </div>

                {item.description && (
                  <p className="mt-1 truncate text-sm text-gray-400">{item.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-right">
                <p
                  className={cn(
                    'text-lg font-bold',
                    item.type === 'expense' ? 'text-red-600' : 'text-green-600'
                  )}
                >
                  {item.type === 'expense' ? '-' : '+'}
                  {formatCurrency(item.amount)}
                </p>

                {/* Status Badge */}
                <div className="mt-1">
                  {item.isPaidThisMonth ? (
                    <Badge variant="success">
                      <Check className="mr-1 h-3 w-3" /> Pagado
                    </Badge>
                  ) : overdue ? (
                    <Badge variant="danger">Vencido</Badge>
                  ) : dueSoon ? (
                    <Badge variant="warning">En {daysUntil} días</Badge>
                  ) : (
                    <Badge variant="outline">En {daysUntil} días</Badge>
                  )}
                </div>
              </div>

              {/* Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                      <button
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setShowMenu(false);
                          onEdit();
                        }}
                      >
                        <Pencil className="h-4 w-4" /> Editar
                      </button>
                      <button
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setShowMenu(false);
                          onToggleActive(item.id, item.isActive);
                        }}
                      >
                        <Power className="h-4 w-4" />
                        {item.isActive ? 'Pausar' : 'Activar'}
                      </button>
                      <button
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setShowMenu(false);
                          onDelete(item.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" /> Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Pay Button */}
          {!item.isPaidThisMonth && item.isActive && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <Button
                variant={overdue ? 'destructive' : dueSoon ? 'default' : 'outline'}
                size="sm"
                className="w-full"
                onClick={() => setShowPayDialog(true)}
              >
                <Check className="mr-2 h-4 w-4" />
                Registrar Pago
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pay Dialog */}
      <Dialog open={showPayDialog} onClose={() => setShowPayDialog(false)}>
        <DialogHeader>
          <DialogTitle>Registrar Pago: {item.name}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Monto a pagar</label>
              <Input
                type="number"
                step="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="mt-1"
              />
              <p className="mt-1 text-sm text-gray-500">
                Monto original: {formatCurrency(item.amount)}
              </p>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowPayDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handlePay}>Confirmar Pago</Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
