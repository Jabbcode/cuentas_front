import { ArrowUpCircle, ArrowDownCircle, AlertTriangle } from 'lucide-react';
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
import type { Account, Category } from '../../../types';
import type { TransactionFormData, DateWarning } from '../types';

export interface TransactionFormDialogProps {
  open: boolean;
  formData: TransactionFormData;
  filteredCategories: Category[];
  accounts: Account[];
  dateWarning: DateWarning;
  saving: boolean;
  onClose: () => void;
  onTypeChange: (type: 'expense' | 'income') => void;
  onFormDataChange: (patch: Partial<TransactionFormData>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function TransactionFormDialog({
  open,
  formData,
  filteredCategories,
  accounts,
  dateWarning,
  saving,
  onClose,
  onTypeChange,
  onFormDataChange,
  onSubmit,
}: TransactionFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Nueva Transacción</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit}>
        <DialogContent className="space-y-4">
          <div>
            <Label>Tipo</Label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={formData.type === 'expense' ? 'destructive' : 'outline'}
                className="w-full"
                onClick={() => onTypeChange('expense')}
              >
                <ArrowDownCircle className="mr-2 h-4 w-4" />
                Gasto
              </Button>
              <Button
                type="button"
                variant={formData.type === 'income' ? 'success' : 'outline'}
                className="w-full"
                onClick={() => onTypeChange('income')}
              >
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Ingreso
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              aria-label="Monto de la transacción"
              value={formData.amount}
              onChange={(e) => onFormDataChange({ amount: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="account">Cuenta</Label>
            <select
              id="account"
              value={formData.accountId}
              onChange={(e) => onFormDataChange({ accountId: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              required
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Categoría</Label>
            <CategorySelect
              categories={filteredCategories}
              value={formData.categoryId}
              onChange={(categoryId) => onFormDataChange({ categoryId })}
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => onFormDataChange({ date: e.target.value })}
              required
            />
            {dateWarning && (
              <div
                className={`mt-2 flex items-start gap-2 rounded-lg border p-3 ${
                  dateWarning.type === 'error'
                    ? 'border-red-200 bg-red-50'
                    : 'border-amber-200 bg-amber-50'
                }`}
              >
                <AlertTriangle
                  className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                    dateWarning.type === 'error' ? 'text-red-600' : 'text-amber-600'
                  }`}
                />
                <p
                  className={`text-xs ${
                    dateWarning.type === 'error' ? 'text-red-800' : 'text-amber-800'
                  }`}
                >
                  {dateWarning.message}
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              placeholder="Notas..."
              value={formData.description}
              onChange={(e) => onFormDataChange({ description: e.target.value })}
            />
          </div>
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Crear'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
