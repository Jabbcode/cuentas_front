import { useState, useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { debtsApi } from '../../api/debts.api';
import type { Debt, CreateDebtInput } from '../../types';

interface DebtFormProps {
  debt?: Debt;
  onClose: () => void;
  onSuccess: () => void;
}

export function DebtForm({ debt, onClose, onSuccess }: DebtFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    creditor: '',
    description: '',
    totalAmount: '',
    interestRate: '',
    interestType: '' as 'fixed' | 'percentage' | '',
    dueDate: '',
  });

  useEffect(() => {
    if (debt) {
      setFormData({
        creditor: debt.creditor,
        description: debt.description,
        totalAmount: debt.totalAmount.toString(),
        interestRate: debt.interestRate?.toString() || '',
        interestType: debt.interestType || '',
        dueDate: debt.dueDate ? new Date(debt.dueDate).toISOString().split('T')[0] : '',
      });
    }
  }, [debt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: CreateDebtInput = {
        creditor: formData.creditor,
        description: formData.description,
        totalAmount: parseFloat(formData.totalAmount),
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
        interestType: formData.interestType || undefined,
        dueDate: formData.dueDate || undefined,
      };

      if (debt) {
        await debtsApi.update(debt.id, data);
      } else {
        await debtsApi.create(data);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving debt:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{debt ? 'Editar Deuda' : 'Nueva Deuda'}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-4">
          <div>
            <Label htmlFor="creditor">Acreedor *</Label>
            <Input
              id="creditor"
              placeholder="Ej: Juan, Banco BBVA"
              value={formData.creditor}
              onChange={(e) => setFormData({ ...formData, creditor: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción *</Label>
            <Input
              id="description"
              placeholder="Ej: Préstamo personal, Compra de coche"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="totalAmount">Monto Total *</Label>
            <Input
              id="totalAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="1000.00"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              required
              disabled={!!debt} // Can't change total amount when editing
            />
            {debt && (
              <p className="text-xs text-gray-500 mt-1">
                El monto total no se puede modificar después de crear la deuda
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="dueDate">Fecha de Vencimiento (Opcional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-3">Interés (Opcional)</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="interestRate">Tasa</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="5.00"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="interestType">Tipo</Label>
                <Select
                  id="interestType"
                  value={formData.interestType}
                  onChange={(e) => setFormData({ ...formData, interestType: e.target.value as any })}
                >
                  <option value="">Seleccionar</option>
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Fijo (€)</option>
                </Select>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              El interés se aplicará sobre el monto restante en cada pago
            </p>
          </div>
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : debt ? 'Guardar' : 'Crear'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
