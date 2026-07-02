import { useState, useEffect } from 'react';
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
import { formatCurrency } from '../../../lib/utils';
import { useAccounts } from '../../accounts/hooks/useAccounts';
import { recurringDebtPaymentsApi } from '../api';
import { suggestMonthlyAmount, calcPeriodsToPayOff } from '../utils';
import type { Debt, RecurringDebtPayment } from '../../../types';

export interface RecurringPaymentModalProps {
  debt: Debt;
  recurringPayment?: RecurringDebtPayment;
  onClose: () => void;
  onSuccess: () => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly', label: 'Mensual' },
] as const;

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
] as const;

type Frequency = 'monthly' | 'biweekly' | 'weekly';

interface RecurringFormData {
  amount: string;
  accountId: string;
  frequency: Frequency;
  dayOfMonth: string;
  dayOfWeek: string;
  endDate: string;
  notes: string;
}

export function RecurringPaymentModal({
  debt,
  recurringPayment,
  onClose,
  onSuccess,
}: RecurringPaymentModalProps) {
  const { accounts } = useAccounts();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RecurringFormData>({
    amount: '',
    accountId: '',
    frequency: 'monthly',
    dayOfMonth: '1',
    dayOfWeek: '1',
    endDate: '',
    notes: '',
  });

  useEffect(() => {
    if (recurringPayment) {
      setFormData({
        amount: recurringPayment.amount.toString(),
        accountId: recurringPayment.accountId,
        frequency: recurringPayment.frequency,
        dayOfMonth: recurringPayment.dayOfMonth?.toString() ?? '1',
        dayOfWeek: recurringPayment.dayOfWeek?.toString() ?? '1',
        endDate: recurringPayment.endDate
          ? new Date(recurringPayment.endDate).toISOString().split('T')[0]
          : '',
        notes: recurringPayment.notes ?? '',
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        amount: suggestMonthlyAmount(Number(debt.remainingAmount)).toFixed(2),
      }));
    }
  }, [recurringPayment, debt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        debtId: debt.id,
        amount: parseFloat(formData.amount),
        accountId: formData.accountId,
        frequency: formData.frequency,
        dayOfMonth: formData.frequency === 'monthly' ? parseInt(formData.dayOfMonth) : undefined,
        dayOfWeek: formData.frequency === 'weekly' ? parseInt(formData.dayOfWeek) : undefined,
        endDate: formData.endDate || undefined,
        notes: formData.notes || undefined,
      };

      if (recurringPayment) {
        await recurringDebtPaymentsApi.update(recurringPayment.id, payload);
      } else {
        await recurringDebtPaymentsApi.create(payload);
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving recurring payment:', err);
    } finally {
      setLoading(false);
    }
  };

  const paymentAmount = parseFloat(formData.amount) || 0;
  const remainingAmount = Number(debt.remainingAmount);
  const periodsToPayOff = calcPeriodsToPayOff(remainingAmount, paymentAmount);

  const periodLabel =
    formData.frequency === 'monthly'
      ? 'meses'
      : formData.frequency === 'biweekly'
        ? 'quincenas'
        : 'semanas';

  return (
    <Dialog open onClose={onClose}>
      <DialogHeader>
        <DialogTitle>
          {recurringPayment ? 'Editar Pago Automático' : 'Configurar Pago Automático'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Debt Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm font-medium text-blue-900">{debt.creditor}</p>
            <p className="text-xs text-blue-700">{debt.description}</p>
            <p className="text-lg font-bold text-blue-900 mt-2">
              Deuda restante: {formatCurrency(debt.remainingAmount)}
            </p>
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount">Monto del Pago Automático *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            {paymentAmount > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                Tiempo estimado de pago:{' '}
                <span className="font-medium">
                  {periodsToPayOff} {periodLabel}
                </span>
              </p>
            )}
          </div>

          {/* Frequency */}
          <div>
            <Label htmlFor="frequency">Frecuencia *</Label>
            <Select
              id="frequency"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Frequency })}
              required
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Day of Month */}
          {formData.frequency === 'monthly' && (
            <div>
              <Label htmlFor="dayOfMonth">Día del Mes *</Label>
              <Select
                id="dayOfMonth"
                value={formData.dayOfMonth}
                onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                required
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    Día {day}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Day of Week */}
          {formData.frequency === 'weekly' && (
            <div>
              <Label htmlFor="dayOfWeek">Día de la Semana *</Label>
              <Select
                id="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                required
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Account */}
          <div>
            <Label htmlFor="accountId">Cuenta para el Pago *</Label>
            <Select
              id="accountId"
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              required
            >
              <option value="">Seleccionar cuenta</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - {formatCurrency(Number(account.balance))}
                </option>
              ))}
            </Select>
          </div>

          {/* End Date */}
          <div>
            <Label htmlFor="endDate">Fecha de Finalización (Opcional)</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
            <p className="text-xs text-gray-600 mt-1">
              Si no se especifica, los pagos continuarán hasta que la deuda esté pagada
            </p>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Input
              id="notes"
              placeholder="Notas adicionales"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Info Box */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
            <p className="font-medium text-green-900">Información importante</p>
            <ul className="mt-2 space-y-1 text-xs text-green-800">
              <li>Los pagos se procesarán automáticamente en las fechas programadas</li>
              <li>Asegúrate de tener saldo suficiente en la cuenta seleccionada</li>
              <li>Puedes pausar o editar los pagos automáticos en cualquier momento</li>
            </ul>
          </div>
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : recurringPayment ? 'Guardar' : 'Activar'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
