import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
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
import { useTransfer } from '../../../hooks/useTransfer';
import type { Account } from '../../../types';

interface Props {
  accounts: Account[];
  onClose: () => void;
  onSuccess: () => void;
}

export function TransferModal({ accounts, onClose, onSuccess }: Props) {
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id ?? '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const { transfer, loading, error } = useTransfer(onSuccess);

  const fromAccount = accounts.find((a) => a.id === fromAccountId);
  const toAccount = accounts.find((a) => a.id === toAccountId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await transfer({
      fromAccountId,
      toAccountId,
      amount: parseFloat(amount),
      note: note || undefined,
    });
  };

  const availableDestinations = accounts.filter((a) => a.id !== fromAccountId);

  return (
    <Dialog open onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Transferir entre cuentas</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}

            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <div className="space-y-1">
                <Label>Origen</Label>
                <Select
                  value={fromAccountId}
                  onChange={(e) => {
                    setFromAccountId(e.target.value);
                    if (toAccountId === e.target.value) {
                      setToAccountId(accounts.find((a) => a.id !== e.target.value)?.id ?? '');
                    }
                  }}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
                {fromAccount && (
                  <p className="text-xs text-gray-500">
                    Saldo: {formatCurrency(fromAccount.balance)}
                  </p>
                )}
              </div>

              <ArrowRight className="mb-4 h-5 w-5 shrink-0 text-gray-500" />

              <div className="space-y-1">
                <Label>Destino</Label>
                <Select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
                  {availableDestinations.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
                {toAccount && (
                  <p className="text-xs text-gray-500">
                    Saldo: {formatCurrency(toAccount.balance)}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="note">Nota (opcional)</Label>
              <Input
                id="note"
                type="text"
                placeholder="Descripción de la transferencia"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || !amount || fromAccountId === toAccountId}>
            {loading ? 'Transfiriendo...' : 'Transferir'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
