import { useState, useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { formatCurrency } from '../../lib/utils';
import { useAccounts } from '../../hooks/useAccounts';
import type { Debt } from '../../types';

interface DebtPaymentModalProps {
  debt: Debt;
  onClose: () => void;
  onPay: (amount: number, accountId: string, notes?: string) => Promise<void>;
}

export function DebtPaymentModal({ debt, onClose, onPay }: DebtPaymentModalProps) {
  const { accounts } = useAccounts();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState<'full' | 'custom'>('full');

  const calculateInterest = () => {
    if (!debt.interestRate || !debt.interestType) return 0;

    const remainingAmount = Number(debt.remainingAmount);
    const interestRate = Number(debt.interestRate);

    if (debt.interestType === 'percentage') {
      return (remainingAmount * interestRate) / 100;
    } else {
      return interestRate;
    }
  };

  const interest = calculateInterest();
  const paymentAmount = parseFloat(amount) || 0;
  const remainingAmount = Number(debt.remainingAmount);
  const principal = Math.min(Math.max(0, paymentAmount - interest), remainingAmount);
  const newRemaining = remainingAmount - principal;

  useEffect(() => {
    // Set default amount based on payment mode
    if (paymentMode === 'full') {
      const fullAmount = Number(debt.remainingAmount) + interest;
      setAmount(fullAmount.toFixed(2));
    } else if (paymentMode === 'custom' && !amount) {
      // Start with interest only for custom mode
      setAmount(interest > 0 ? interest.toFixed(2) : '');
    }
  }, [debt, interest, paymentMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onPay(parseFloat(amount), accountId, notes || undefined);
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter accounts with sufficient balance
  const availableAccounts = accounts.filter(acc => Number(acc.balance) >= paymentAmount);

  return (
    <Dialog open onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Pagar Deuda</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-4">
          {/* Debt Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm font-medium text-blue-900">{debt.creditor}</p>
            <p className="text-xs text-blue-700">{debt.description}</p>
            <p className="text-lg font-bold text-blue-900 mt-2">
              Deuda restante: {formatCurrency(debt.remainingAmount)}
            </p>
          </div>

          {/* Payment Mode Selection */}
          <div>
            <Label>Tipo de Pago</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => setPaymentMode('full')}
                className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                  paymentMode === 'full'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                💰 Pago Total
                <p className="text-xs font-normal mt-1 text-gray-600">
                  {formatCurrency(Number(debt.remainingAmount) + interest)}
                </p>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('custom')}
                className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                  paymentMode === 'custom'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                ✏️ Monto Personalizado
                <p className="text-xs font-normal mt-1 text-gray-600">
                  Elige el monto
                </p>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount">
              Monto a Pagar *
              {paymentMode === 'custom' && (
                <span className="text-xs font-normal text-gray-500 ml-2">
                  (Puedes pagar cualquier cantidad)
                </span>
              )}
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (paymentMode === 'full' && e.target.value !== (Number(debt.remainingAmount) + interest).toFixed(2)) {
                    setPaymentMode('custom');
                  }
                }}
                required
                className={paymentMode === 'custom' ? 'border-blue-300' : ''}
              />
            </div>

            {/* Quick Amount Buttons for Custom Mode */}
            {paymentMode === 'custom' && (
              <div className="flex gap-2 mt-2">
                {interest > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(interest.toFixed(2))}
                    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    Solo interés ({formatCurrency(interest)})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setAmount((remainingAmount / 2).toFixed(2))}
                  className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Mitad ({formatCurrency(remainingAmount / 2)})
                </button>
              </div>
            )}

            <div className="mt-2 space-y-1 text-xs">
              {interest > 0 && (
                <p className="text-gray-600">
                  • Interés calculado: <span className="font-medium">{formatCurrency(interest)}</span>
                </p>
              )}
              <p className="text-gray-600">
                • Aplicado al principal: <span className="font-medium text-blue-600">{formatCurrency(principal)}</span>
              </p>
              <p className="text-gray-900 font-medium">
                • Nuevo saldo restante: <span className={newRemaining <= 0 ? 'text-green-600' : 'text-orange-600'}>
                  {formatCurrency(Math.max(0, newRemaining))}
                </span>
                {newRemaining <= 0 && ' ✓ Deuda liquidada'}
              </p>
            </div>
          </div>

          {/* Account */}
          <div>
            <Label htmlFor="accountId">Cuenta de Pago *</Label>
            <Select
              id="accountId"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
            >
              <option value="">Seleccionar cuenta</option>
              {accounts.map((account) => {
                const hasBalance = Number(account.balance) >= paymentAmount;
                return (
                  <option key={account.id} value={account.id} disabled={!hasBalance}>
                    {account.name} - {formatCurrency(Number(account.balance))}
                    {!hasBalance && ' (Saldo insuficiente)'}
                  </option>
                );
              })}
            </Select>
            {availableAccounts.length === 0 && paymentAmount > 0 && (
              <p className="text-xs text-red-600 mt-1">
                Ninguna cuenta tiene saldo suficiente para este pago
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Input
              id="notes"
              placeholder="Notas adicionales sobre este pago"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Warning if paying more than remaining */}
          {paymentAmount > Number(debt.remainingAmount) + interest && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-2 text-xs text-orange-700">
              El monto ingresado es mayor al monto restante + interés
            </div>
          )}
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || !accountId || availableAccounts.length === 0}
          >
            {loading ? 'Procesando...' : 'Confirmar Pago'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
