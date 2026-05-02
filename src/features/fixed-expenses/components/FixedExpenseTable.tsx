import { useState, useRef } from 'react';
import { Check, MoreVertical, Pencil, Trash2, Power, Calendar, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '../../../components/ui/dialog';
import { CategoryIcon } from '../../../components/ui/category-icon';
import {
  formatCurrency,
  getDaysUntilDue,
  isDueSoon,
  isOverdue,
  getNextDueDate,
  formatShortDate,
  cn,
} from '../../../lib/utils';
import type { FixedExpense } from '../../../types';

type FixedExpenseWithStatus = FixedExpense & { isPaidThisMonth: boolean };

export interface FixedExpenseTableProps {
  title: string;
  items: FixedExpenseWithStatus[];
  type: 'expense' | 'income';
  totalAmount: number;
  icon: React.ReactNode;
  onPay: (id: string, amount?: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export function FixedExpenseTable({
  title,
  items,
  type,
  totalAmount,
  icon,
  onPay,
  onEdit,
  onDelete,
  onToggleActive,
}: FixedExpenseTableProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const [payingItem, setPayingItem] = useState<FixedExpenseWithStatus | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handlePayClick = (item: FixedExpenseWithStatus) => {
    setPayAmount(item.amount.toString());
    setPayingItem(item);
  };

  const handleConfirmPay = () => {
    if (!payingItem) return;
    const amount = parseFloat(payAmount);
    if (amount !== payingItem.amount) {
      onPay(payingItem.id, amount);
    } else {
      onPay(payingItem.id);
    }
    setPayingItem(null);
  };

  const handleMenuToggle = (itemId: string, buttonElement: HTMLButtonElement) => {
    if (menuOpen === itemId) {
      setMenuOpen(null);
      setMenuPosition(null);
    } else {
      const rect = buttonElement.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
      setMenuOpen(itemId);
    }
  };

  const getStatusBadge = (item: FixedExpenseWithStatus) => {
    const isCreditCard = !!item.creditCardAccountId;
    const daysUntil = getDaysUntilDue(item.dueDay, item.isPaidThisMonth, isCreditCard);
    const dueSoon = isDueSoon(item.dueDay, item.isPaidThisMonth, isCreditCard);
    const overdue = isOverdue(item.dueDay, item.isPaidThisMonth, isCreditCard);

    if (item.isPaidThisMonth) {
      return (
        <Badge variant="success">
          <Check className="mr-1 h-3 w-3" />
          {type === 'income' ? 'Recibido' : 'Pagado'}
        </Badge>
      );
    }
    if (overdue) {
      return <Badge variant="danger">Vencido</Badge>;
    }
    if (dueSoon) {
      return <Badge variant="warning">{daysUntil}d</Badge>;
    }
    return <Badge variant="outline">{daysUntil}d</Badge>;
  };

  const MobileCard = ({ item }: { item: FixedExpenseWithStatus }) => {
    const isCreditCard = !!item.creditCardAccountId;
    const overdue = isOverdue(item.dueDay, item.isPaidThisMonth, isCreditCard);
    const dueSoon = isDueSoon(item.dueDay, item.isPaidThisMonth, isCreditCard) && !overdue;

    return (
      <div
        className={cn(
          'rounded-lg border p-3 transition-colors',
          !item.isActive && 'opacity-50',
          item.isPaidThisMonth && 'border-green-200 bg-green-50/50',
          overdue && 'border-red-200 bg-red-50/50',
          dueSoon && 'border-orange-200 bg-orange-50/50',
          !item.isPaidThisMonth && !overdue && !dueSoon && 'border-gray-200 bg-white'
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <CategoryIcon
              icon={item.category?.icon}
              color={item.category?.color}
              size="md"
              tooltip={item.category?.name}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="truncate font-medium text-gray-900">{item.name}</span>
                {item.autoGenerate && (
                  <Zap
                    className="h-3 w-3 shrink-0 text-amber-500"
                    aria-label="Pago automático activo"
                  />
                )}
                {!item.isActive && (
                  <Badge variant="secondary" className="px-1 text-[10px]">
                    Pausado
                  </Badge>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatShortDate(getNextDueDate(item.dueDay, item.isPaidThisMonth, isCreditCard))}
                </span>
                <span>•</span>
                <span>{item.account?.name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {getStatusBadge(item)}
            <Button
              ref={(el) => {
                buttonRefs.current[item.id] = el;
              }}
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                if (e.currentTarget instanceof HTMLButtonElement) {
                  handleMenuToggle(item.id, e.currentTarget);
                }
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span
            className={cn(
              'text-lg font-bold',
              type === 'expense' ? 'text-red-600' : 'text-green-600'
            )}
          >
            {type === 'expense' ? '-' : '+'}
            {formatCurrency(item.amount)}
          </span>
          {!item.isPaidThisMonth && item.isActive && (
            <Button
              variant={overdue ? 'destructive' : dueSoon ? 'default' : 'outline'}
              size="sm"
              className="h-8"
              onClick={() => handlePayClick(item)}
            >
              <Check className="mr-1 h-3 w-3" /> {type === 'income' ? 'Recibir' : 'Pagar'}
            </Button>
          )}
        </div>
      </div>
    );
  };

  const DesktopRow = ({ item }: { item: FixedExpenseWithStatus }) => {
    const isCreditCard = !!item.creditCardAccountId;
    const overdue = isOverdue(item.dueDay, item.isPaidThisMonth, isCreditCard);
    const dueSoon = isDueSoon(item.dueDay, item.isPaidThisMonth, isCreditCard) && !overdue;

    return (
      <tr
        className={cn(
          'transition-colors',
          !item.isActive && 'opacity-50',
          item.isPaidThisMonth && 'bg-green-50/50',
          overdue && 'bg-red-50/50',
          dueSoon && 'bg-orange-50/50'
        )}
      >
        <td className="px-3 py-2">
          <div className="flex items-center gap-2">
            <CategoryIcon
              icon={item.category?.icon}
              color={item.category?.color}
              size="sm"
              tooltip={item.category?.name}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="truncate font-medium text-gray-900">{item.name}</span>
                {item.autoGenerate && (
                  <Zap
                    className="h-3 w-3 shrink-0 text-amber-500"
                    aria-label="Pago automático activo"
                  />
                )}
                {!item.isActive && (
                  <Badge variant="secondary" className="px-1 text-[10px]">
                    Pausado
                  </Badge>
                )}
              </div>
              <p className="truncate text-xs text-gray-500">{item.account?.name}</p>
            </div>
          </div>
        </td>
        <td className="px-3 py-2 text-center">
          <span className="text-sm font-medium text-gray-700">
            {formatShortDate(getNextDueDate(item.dueDay, item.isPaidThisMonth, isCreditCard))}
          </span>
        </td>
        <td className="px-3 py-2 text-right">
          <span
            className={cn('font-semibold', type === 'expense' ? 'text-red-600' : 'text-green-600')}
          >
            {formatCurrency(item.amount)}
          </span>
        </td>
        <td className="px-3 py-2 text-center">{getStatusBadge(item)}</td>
        <td className="px-3 py-2">
          <div className="flex items-center justify-end gap-1">
            {!item.isPaidThisMonth && item.isActive && (
              <Button
                variant={overdue ? 'destructive' : dueSoon ? 'default' : 'outline'}
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handlePayClick(item)}
                title={type === 'income' ? 'Recibir' : 'Pagar'}
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button
              ref={(el) => {
                buttonRefs.current[item.id] = el;
              }}
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                if (e.currentTarget instanceof HTMLButtonElement) {
                  handleMenuToggle(item.id, e.currentTarget);
                }
              }}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </div>
        </td>
      </tr>
    );
  };

  const currentItem = items.find((item) => item.id === menuOpen);

  return (
    <>
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <CardTitle className="text-base">{title}</CardTitle>
            </div>
            <span
              className={cn(
                'text-sm font-bold',
                type === 'expense' ? 'text-red-600' : 'text-green-600'
              )}
            >
              {formatCurrency(totalAmount)}/mes
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {items.length > 0 ? (
            <>
              {/* Vista movil - Cards */}
              <div className="space-y-2 p-3 md:hidden">
                {items.map((item) => (
                  <MobileCard key={item.id} item={item} />
                ))}
              </div>

              {/* Vista desktop - Tabla */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500">
                      <th className="px-3 py-2">Nombre</th>
                      <th className="px-3 py-2 text-center">Vencimiento</th>
                      <th className="px-3 py-2 text-right">Monto</th>
                      <th className="px-3 py-2 text-center">Estado</th>
                      <th className="w-20 px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <DesktopRow key={item.id} item={item} />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-sm text-gray-500">
              No tienes {type === 'expense' ? 'gastos' : 'ingresos'} fijos
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Menu */}
      {menuOpen && menuPosition && currentItem && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setMenuOpen(null);
              setMenuPosition(null);
            }}
          />
          <div
            className="fixed z-50 w-32 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
            style={{
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`,
            }}
          >
            <button
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setMenuOpen(null);
                setMenuPosition(null);
                onEdit(currentItem.id);
              }}
            >
              <Pencil className="h-3 w-3" /> Editar
            </button>
            <button
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setMenuOpen(null);
                setMenuPosition(null);
                onToggleActive(currentItem.id, currentItem.isActive);
              }}
            >
              <Power className="h-3 w-3" />
              {currentItem.isActive ? 'Pausar' : 'Activar'}
            </button>
            <button
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-red-600 hover:bg-red-50"
              onClick={() => {
                setMenuOpen(null);
                setMenuPosition(null);
                onDelete(currentItem.id);
              }}
            >
              <Trash2 className="h-3 w-3" /> Eliminar
            </button>
          </div>
        </>
      )}

      {/* Pay Dialog */}
      {payingItem && (
        <Dialog open onClose={() => setPayingItem(null)}>
          <DialogHeader>
            <DialogTitle>
              {type === 'income' ? 'Registrar Ingreso' : 'Registrar Pago'}: {payingItem.name}
            </DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {type === 'income' ? 'Monto recibido' : 'Monto a pagar'}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="mt-1"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Monto original: {formatCurrency(payingItem.amount)}
                </p>
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayingItem(null)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmPay}>
              {type === 'income' ? 'Confirmar Ingreso' : 'Confirmar Pago'}
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </>
  );
}
