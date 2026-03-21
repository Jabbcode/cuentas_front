import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { formatCurrency } from '../../lib/utils';
import type { CreditCardStatement, Account } from '../../types';
import type { PaymentFormData } from '../../hooks/usePaymentModal';

interface CreditCardPaymentModalProps {
  open: boolean;
  statement: CreditCardStatement | null;
  formData: PaymentFormData;
  accounts: Account[];
  paying: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (data: Partial<PaymentFormData>) => void;
}

export function CreditCardPaymentModal({
  open,
  statement,
  formData,
  accounts,
  paying,
  onClose,
  onSubmit,
  onFormChange,
}: CreditCardPaymentModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Pagar Estado de Cuenta</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit}>
        <DialogContent className="space-y-4">
          {statement && (
            <>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Tarjeta</p>
                <p className="text-lg font-medium">{statement.account.name}</p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  {formatCurrency(statement.closedPeriod.balance)}
                </p>
              </div>

              <div>
                <Label htmlFor="amount">Monto a pagar</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={statement.closedPeriod.balance}
                  value={formData.amount}
                  onChange={(e) => onFormChange({ amount: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Monto máximo: {formatCurrency(statement.closedPeriod.balance)}
                </p>
              </div>

              <div>
                <Label htmlFor="paymentAccount">Pagar desde</Label>
                <Select
                  id="paymentAccount"
                  value={formData.paymentAccountId}
                  onChange={(e) => onFormChange({ paymentAccountId: e.target.value })}
                  required
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.balance)})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentDate">Fecha de pago</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => onFormChange({ paymentDate: e.target.value })}
                  required
                />
              </div>
            </>
          )}
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={paying}>
            {paying ? 'Procesando...' : 'Pagar'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
