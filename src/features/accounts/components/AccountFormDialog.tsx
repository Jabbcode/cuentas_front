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
import { cn } from '../../../lib/utils';
import type { Account } from '../../../types';
import type { AccountFormData } from '../types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface Props {
  open: boolean;
  editingAccount: Account | null;
  formData: AccountFormData;
  saving: boolean;
  accounts: Account[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onFormDataChange: React.Dispatch<React.SetStateAction<AccountFormData>>;
}

export function AccountFormDialog({
  open,
  editingAccount,
  formData,
  saving,
  accounts,
  onClose,
  onSubmit,
  onFormDataChange,
}: Props) {
  const set = (field: Partial<AccountFormData>) =>
    onFormDataChange((prev) => ({ ...prev, ...field }));

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}</DialogTitle>
      </DialogHeader>

      <form onSubmit={onSubmit}>
        <DialogContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Ej: Banco Santander, Efectivo"
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
              onChange={(e) => set({ type: e.target.value as Account['type'] })}
            >
              <option value="bank">Banco</option>
              <option value="cash">Efectivo</option>
              <option value="credit_card">Tarjeta de Crédito</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="balance">Balance inicial</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => set({ balance: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <div className="mt-1 flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    'h-8 w-8 rounded-full transition-transform',
                    formData.color === color && 'scale-110 ring-2 ring-gray-400 ring-offset-2'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => set({ color })}
                />
              ))}
            </div>
          </div>

          {formData.type === 'credit_card' && (
            <CreditCardFields
              formData={formData}
              accounts={accounts}
              editingAccountId={editingAccount?.id}
              onChange={set}
            />
          )}
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : editingAccount ? 'Guardar' : 'Crear'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

interface CreditCardFieldsProps {
  formData: AccountFormData;
  accounts: Account[];
  editingAccountId?: string;
  onChange: (field: Partial<AccountFormData>) => void;
}

function CreditCardFields({
  formData,
  accounts,
  editingAccountId,
  onChange,
}: CreditCardFieldsProps) {
  const debitAccounts = accounts.filter(
    (acc) => acc.type !== 'credit_card' && acc.id !== editingAccountId
  );

  return (
    <>
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
        <p className="mb-2 text-sm font-medium text-purple-900">
          Configuración de Tarjeta de Crédito
        </p>
        <p className="text-xs text-purple-700">
          Completa estos campos para habilitar el seguimiento de períodos de corte y pagos.
        </p>
      </div>

      <div>
        <Label htmlFor="creditLimit">Límite de Crédito</Label>
        <Input
          id="creditLimit"
          type="number"
          step="0.01"
          min="0"
          placeholder="Ej: 5000.00"
          value={formData.creditLimit}
          onChange={(e) => onChange({ creditLimit: e.target.value })}
        />
        <p className="mt-1 text-xs text-gray-500">Monto máximo disponible en la tarjeta</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cutoffDay">Día de Corte</Label>
          <Input
            id="cutoffDay"
            type="number"
            min="1"
            max="31"
            placeholder="Ej: 15"
            value={formData.cutoffDay}
            onChange={(e) => onChange({ cutoffDay: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">Día que cierra el período (1-31)</p>
        </div>

        <div>
          <Label htmlFor="paymentDueDay">Día de Pago</Label>
          <Input
            id="paymentDueDay"
            type="number"
            min="1"
            max="31"
            placeholder="Ej: 30"
            value={formData.paymentDueDay}
            onChange={(e) => onChange({ paymentDueDay: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">Día de vencimiento del pago (1-31)</p>
        </div>
      </div>

      <div>
        <Label htmlFor="paymentAccountId">Cuenta de Débito para Pago</Label>
        <Select
          id="paymentAccountId"
          value={formData.paymentAccountId}
          onChange={(e) => onChange({ paymentAccountId: e.target.value })}
        >
          <option value="">Seleccionar cuenta...</option>
          {debitAccounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({acc.type === 'bank' ? 'Banco' : 'Efectivo'})
            </option>
          ))}
        </Select>
        <p className="mt-1 text-xs text-gray-500">
          Cuenta desde la cual se descontará el pago de la tarjeta
        </p>
      </div>
    </>
  );
}
