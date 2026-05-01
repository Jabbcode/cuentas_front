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
import { IconPicker } from '../../../components/ui/icon-picker';
import { cn } from '../../../lib/utils';
import { CATEGORY_COLORS } from '../utils';
import type { Category } from '../../../types';
import type { CategoryFormData } from '../types';

export interface CategoryFormDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** The category being edited, or null when creating */
  editingCategory: Category | null;
  /** Current form state */
  formData: CategoryFormData;
  /** Whether a save operation is in progress */
  saving: boolean;
  /** Error message to display, empty string means no error */
  error: string;
  /** Called to close the dialog */
  onClose: () => void;
  /** Called on form submit */
  onSubmit: (e: React.FormEvent) => Promise<void>;
  /** Called to update form data */
  onFormDataChange: React.Dispatch<React.SetStateAction<CategoryFormData>>;
}

export function CategoryFormDialog({
  open,
  editingCategory,
  formData,
  saving,
  error,
  onClose,
  onSubmit,
  onFormDataChange,
}: CategoryFormDialogProps) {
  const set = (field: Partial<CategoryFormData>) =>
    onFormDataChange((prev) => ({ ...prev, ...field }));

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
      </DialogHeader>

      <form onSubmit={onSubmit}>
        <DialogContent className="space-y-4">
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Ej: Alimentación, Transporte"
              value={formData.name}
              onChange={(e) => set({ name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select
              id="type"
              value={formData.type}
              onChange={(e) => set({ type: e.target.value as 'expense' | 'income' })}
            >
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
            </Select>
          </div>

          <div>
            <Label>Icono y Color</Label>
            <div className="mt-1 flex items-center gap-4">
              <IconPicker
                value={formData.icon}
                onChange={(icon) => set({ icon })}
                color={formData.color}
              />
              <div className="flex-1">
                <div className="flex gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        'h-8 w-8 rounded-full transition-transform',
                        formData.color === color && 'scale-110 ring-2 ring-offset-2 ring-gray-400'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => set({ color })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {formData.type === 'expense' && (
            <MonthlyLimitField
              value={formData.monthlyLimit}
              onChange={(monthlyLimit) => set({ monthlyLimit })}
            />
          )}
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : editingCategory ? 'Guardar' : 'Crear'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

interface MonthlyLimitFieldProps {
  value: string;
  onChange: (value: string) => void;
}

function MonthlyLimitField({ value, onChange }: MonthlyLimitFieldProps) {
  return (
    <div>
      <Label htmlFor="monthlyLimit">Límite Mensual (opcional)</Label>
      <div className="relative">
        <Input
          id="monthlyLimit"
          type="number"
          step="0.01"
          min="0"
          placeholder="Ej: 500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={value ? 'pr-8' : ''}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            title="Quitar límite"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Establece un límite mensual de gasto para esta categoría. Puedes dejarlo vacío para quitar
        el límite.
      </p>
    </div>
  );
}
