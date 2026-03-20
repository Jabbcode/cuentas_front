import { useEffect, useState, useCallback } from 'react';
import { Plus, Wallet, CreditCard, Banknote, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../components/ui/dialog';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { accountsApi } from '../api/accounts.api';
import { formatCurrency, cn } from '../lib/utils';
import type { Account } from '../types';

const accountTypeIcons = {
  cash: Banknote,
  bank: Wallet,
  credit_card: CreditCard,
};

const accountTypeLabels = {
  cash: 'Efectivo',
  bank: 'Banco',
  credit_card: 'Tarjeta de Crédito',
};

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'bank' as 'cash' | 'bank' | 'credit_card',
    balance: '0',
    currency: 'EUR',
    color: '#3B82F6',
  });

  const loadAccounts = useCallback(async () => {
    try {
      const data = await accountsApi.getAll();
      setAccounts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const openForm = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toString(),
        currency: account.currency,
        color: account.color || '#3B82F6',
      });
    } else {
      setEditingAccount(null);
      setFormData({
        name: '',
        type: 'bank',
        balance: '0',
        currency: 'EUR',
        color: '#3B82F6',
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance),
        currency: formData.currency,
        color: formData.color,
      };

      if (editingAccount) {
        await accountsApi.update(editingAccount.id, data);
      } else {
        await accountsApi.create(data);
      }

      setShowForm(false);
      loadAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await accountsApi.delete(deleteId);
      setDeleteId(null);
      loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setDeleting(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

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
        {accounts.map((account) => {
          const Icon = accountTypeIcons[account.type];
          return (
            <Card key={account.id} className="transition-all hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: account.color || '#3B82F6' }}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{account.name}</h3>
                      <p className="text-sm text-gray-500">
                        {accountTypeLabels[account.type]}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setMenuOpen(menuOpen === account.id ? null : account.id)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    {menuOpen === account.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                        <div className="absolute right-0 top-8 z-20 w-32 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                          <button
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setMenuOpen(null);
                              openForm(account);
                            }}
                          >
                            <Pencil className="h-4 w-4" /> Editar
                          </button>
                          <button
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setMenuOpen(null);
                              setDeleteId(account.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" /> Eliminar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p
                    className={cn(
                      'text-2xl font-bold',
                      Number(account.balance) >= 0 ? 'text-gray-900' : 'text-red-600'
                    )}
                  >
                    {formatCurrency(Number(account.balance), account.currency)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {accounts.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="py-12 text-center">
              <Wallet className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No tienes cuentas. Crea una para empezar.</p>
              <Button onClick={() => openForm()} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Crear primera cuenta
              </Button>
            </CardContent>
          </Card>
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
