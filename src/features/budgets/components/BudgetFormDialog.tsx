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
import { Select } from '../../../components/ui/select';
import type { Budget, Category } from '../../../types';
import type { BudgetFormData } from '../types';

export interface BudgetFormDialogProps {
  open: boolean;
  editingBudget: Budget | null;
  categories: Category[];
  availableCategories: Category[];
  formData: BudgetFormData;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onFormDataChange: (data: Partial<BudgetFormData>) => void;
}

export function BudgetFormDialog({
  open,
  editingBudget,
  categories,
  availableCategories,
  formData,
  saving,
  error,
  onClose,
  onSubmit,
  onFormDataChange,
}: BudgetFormDialogProps) {
  const categoryOptions = editingBudget ? categories : availableCategories;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit}>
        <DialogContent className="space-y-4">
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div>
            <Label htmlFor="categoryId">Categoría</Label>
            <Select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) => onFormDataChange({ categoryId: e.target.value })}
              disabled={!!editingBudget}
              required
            >
              <option value="">Selecciona una categoría</option>
              {categoryOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Presupuesto (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Ej: 500"
              value={formData.amount}
              onChange={(e) => onFormDataChange({ amount: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="alertAt">Alerta al (% del presupuesto)</Label>
            <Input
              id="alertAt"
              type="number"
              step="1"
              min="0"
              max="100"
              placeholder="80"
              value={formData.alertAt}
              onChange={(e) => onFormDataChange({ alertAt: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500">
              Alerta visual cuando el gasto supera este porcentaje.
            </p>
          </div>
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : editingBudget ? 'Guardar' : 'Crear'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
