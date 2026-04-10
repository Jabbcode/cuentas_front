import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../components/ui/dialog';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { AccountCard } from '../components/accounts/AccountCard';
import { AccountEmpty } from '../components/accounts/AccountEmpty';
import { useAccounts } from '../hooks/useAccounts';
import { accountsApi } from '../api/accounts.api';
import { formatCurrency, cn } from '../lib/utils';
import type { Account } from '../types';

export function AccountsPage() {
  const { accounts, loading, reload, totalBalance } = useAccounts();
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'bank' as 'cash' | 'bank' | 'credit_card',
    balance: '0',
    currency: 'EUR',
    color: '#3B82F6',
    creditLimit: '',
    cutoffDay: '',
    paymentDueDay: '',
    paymentAccountId: '',
  });

  const openForm = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toString(),
        currency: account.currency,
        color: account.color || '#3B82F6',
        creditLimit: account.creditLimit?.toString() || '',
        cutoffDay: account.cutoffDay?.toString() || '',
        paymentDueDay: account.paymentDueDay?.toString() || '',
        paymentAccountId: account.paymentAccountId || '',
      });
    } else {
      setEditingAccount(null);
      setFormData({
        name: '',
        type: 'bank',
        balance: '0',
        currency: 'EUR',
        color: '#3B82F6',
        creditLimit: '',
        cutoffDay: '',
        paymentDueDay: '',
        paymentAccountId: '',
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance),
        currency: formData.currency,
        color: formData.color,
      };

      if (formData.type === 'credit_card') {
        if (formData.creditLimit) data.creditLimit = parseFloat(formData.creditLimit);
        if (formData.cutoffDay) data.cutoffDay = parseInt(formData.cutoffDay);
        if (formData.paymentDueDay) data.paymentDueDay = parseInt(formData.paymentDueDay);
        if (formData.paymentAccountId) data.paymentAccountId = formData.paymentAccountId;
      }

      if (editingAccount) {
        await accountsApi.update(editingAccount.id, data);
      } else {
        await accountsApi.create(data);
      }

      setShowForm(false);
      reload();
    } catch (error) {
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await accountsApi.delete(deleteId);
      setDeleteId(null);
      reload();
    } catch (error) {
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cuentas</h1>
          <p className="text-gray-500">
            Balance total: <span className="font-semibold text-gray-900">{formatCurrency(totalBalance)}</span>
          </p>
        </div>
        <Button onClick={() => openForm()}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Cuenta
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.length === 0 ? (
          <AccountEmpty onCreateClick={() => openForm()} />
        ) : (
          accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={openForm}
              onDelete={setDeleteId}
            />
          ))
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onClose={() => setShowForm(false)}>
        <DialogHeader>
          <DialogTitle>{editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Ej: Banco Santander, Efectivo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'cash' | 'bank' | 'credit_card' })}
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
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <div className="mt-1 flex gap-2">
                {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      'h-8 w-8 rounded-full transition-transform',
                      formData.color === color && 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            {/* Credit Card specific fields */}
            {formData.type === 'credit_card' && (
              <>
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                  <p className="text-sm font-medium text-purple-900 mb-2">
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
                    onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Monto máximo disponible en la tarjeta</p>
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
                      onChange={(e) => setFormData({ ...formData, cutoffDay: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Día que cierra el período (1-31)</p>
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
                      onChange={(e) => setFormData({ ...formData, paymentDueDay: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Día de vencimiento del pago (1-31)</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="paymentAccountId">Cuenta de Débito para Pago</Label>
                  <Select
                    id="paymentAccountId"
                    value={formData.paymentAccountId}
                    onChange={(e) => setFormData({ ...formData, paymentAccountId: e.target.value })}
                  >
                    <option value="">Seleccionar cuenta...</option>
                    {accounts
                      .filter((acc) => acc.type !== 'credit_card' && acc.id !== editingAccount?.id)
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.type === 'bank' ? 'Banco' : 'Efectivo'})
                        </option>
                      ))}
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Cuenta desde la cual se descontará el pago de la tarjeta
                  </p>
                </div>
              </>
            )}
          </DialogContent>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingAccount ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar cuenta"
        description="¿Estás seguro de eliminar esta cuenta? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
