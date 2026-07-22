import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { CategorySelect } from '../../../components/ui/category-select';
import type { CreditCardStatement, Category } from '../../../types';
import type { ExpenseFormData } from '../types';

interface CreditCardExpenseModalProps {
  open: boolean;
  statement: CreditCardStatement | null;
  formData: ExpenseFormData;
  categories: Category[];
  saving: boolean;
  onClose: () => void;
  onFormChange: (data: Partial<ExpenseFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreditCardExpenseModal({
  open,
  statement,
  formData,
  categories,
  saving,
  onClose,
  onFormChange,
  onSubmit,
}: CreditCardExpenseModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Nuevo Gasto</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit}>
        <DialogContent className="space-y-4">
          {statement && (
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Tarjeta</p>
              <p className="text-lg font-medium">{statement.account.name}</p>
            </div>
          )}

          <div>
            <Label htmlFor="expense-amount">Monto</Label>
            <Input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              aria-label="Monto del gasto"
              value={formData.amount}
              onChange={(e) => onFormChange({ amount: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Categoría</Label>
            <CategorySelect
              categories={categories}
              value={formData.categoryId}
              onChange={(categoryId) => onFormChange({ categoryId })}
              required
            />
          </div>

          <div>
            <Label htmlFor="expense-date">Fecha</Label>
            <Input
              id="expense-date"
              type="date"
              value={formData.date}
              onChange={(e) => onFormChange({ date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="expense-description">Descripción (opcional)</Label>
            <Input
              id="expense-description"
              placeholder="Notas..."
              value={formData.description}
              onChange={(e) => onFormChange({ description: e.target.value })}
            />
          </div>
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Agregar gasto'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
