import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { CategorySelect } from '../ui/category-select';
import { formatCurrency } from '../../lib/utils';
import type { Transaction, Category, Account } from '../../types';
import { AlertTriangle } from 'lucide-react';

const editTransactionSchema = z.object({
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  date: z.string().min(1, 'La fecha es requerida'),
  amount: z.string().min(1, 'El monto es requerido').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'El monto debe ser mayor a 0'
  ),
});

type EditTransactionInput = z.infer<typeof editTransactionSchema>;

interface EditTransactionModalProps {
  open: boolean;
  transaction: Transaction | null;
  categories: Category[];
  account: Account | null;
  onClose: () => void;
  onSave: (id: string, data: EditTransactionInput) => Promise<void>;
}

export function EditTransactionModal({
  open,
  transaction,
  categories,
  account,
  onClose,
  onSave,
}: EditTransactionModalProps) {
  const [saving, setSaving] = useState(false);
  const [showAmountWarning, setShowAmountWarning] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EditTransactionInput>({
    resolver: zodResolver(editTransactionSchema),
  });

  const watchedAmount = watch('amount');

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      reset({
        description: transaction.description || '',
        categoryId: transaction.categoryId,
        date: new Date(transaction.date).toISOString().split('T')[0],
        amount: transaction.amount.toString(),
      });
      setShowAmountWarning(false);
    }
  }, [transaction, reset]);

  // Show warning when amount changes
  useEffect(() => {
    if (transaction && watchedAmount) {
      const originalAmount = parseFloat(transaction.amount.toString());
      const newAmount = parseFloat(watchedAmount);
      setShowAmountWarning(originalAmount !== newAmount && !isNaN(newAmount));
    }
  }, [watchedAmount, transaction]);

  const onSubmit = async (data: EditTransactionInput) => {
    if (!transaction) return;

    setSaving(true);
    try {
      await onSave(transaction.id, data);
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!transaction) return null;

  const filteredCategories = categories.filter(
    (cat) => cat.type === transaction.type
  );

  const originalAmount = parseFloat(transaction.amount.toString());
  const newAmount = watchedAmount ? parseFloat(watchedAmount) : originalAmount;
  const amountDiff = newAmount - originalAmount;
  const newBalance = account
    ? Number(account.balance) + (transaction.type === 'income' ? amountDiff : -amountDiff)
    : 0;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Editar Transacción</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4">
          {/* Description */}
          <div>
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Ej: Compra en Mercadona"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="categoryId">Categoría *</Label>
            <CategorySelect
              categories={filteredCategories}
              value={watch('categoryId')}
              onChange={(categoryId) => setValue('categoryId', categoryId)}
            />
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date">Fecha *</Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
            />
            {errors.date && (
              <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Amount with warning */}
          <div>
            <Label htmlFor="amount">Monto *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount')}
            />
            {errors.amount && (
              <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
            )}

            {/* Amount change warning */}
            {showAmountWarning && account && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-orange-900 mb-2">
                      ⚠️ Cambiar el monto afectará el balance de tu cuenta
                    </p>
                    <div className="space-y-1 text-orange-800">
                      <p>
                        <span className="font-medium">Monto original:</span>{' '}
                        {formatCurrency(originalAmount)}
                      </p>
                      <p>
                        <span className="font-medium">Nuevo monto:</span>{' '}
                        {formatCurrency(newAmount)}
                      </p>
                      <p>
                        <span className="font-medium">Diferencia:</span>{' '}
                        <span className={amountDiff > 0 ? 'text-green-700' : 'text-red-700'}>
                          {amountDiff > 0 ? '+' : ''}
                          {formatCurrency(Math.abs(amountDiff))}
                        </span>
                      </p>
                      <div className="pt-2 mt-2 border-t border-orange-300">
                        <p className="font-medium">
                          Balance de {account.name}:
                        </p>
                        <p>
                          {formatCurrency(Number(account.balance))} → {formatCurrency(newBalance)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transaction info */}
          <div className="pt-3 border-t">
            <p className="text-xs text-gray-500">
              Tipo: <span className="font-medium">{transaction.type === 'income' ? 'Ingreso' : 'Gasto'}</span>
            </p>
            <p className="text-xs text-gray-500">
              Cuenta: <span className="font-medium">{transaction.account?.name}</span>
            </p>
            {transaction.fixedExpenseId && (
              <p className="text-xs text-orange-600 mt-1">
                ⓘ Esta transacción está vinculada a un gasto fijo
              </p>
            )}
          </div>
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
