import { useEffect, useState, useCallback } from 'react';
import { Plus, ArrowUpCircle, ArrowDownCircle, Trash2, ArrowLeftRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../components/ui/dialog';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { CategoryIconBadge } from '../components/ui/category-icon';
import { CategorySelect } from '../components/ui/category-select';
import { transactionsApi } from '../api/transactions.api';
import { accountsApi } from '../api/accounts.api';
import { categoriesApi } from '../api/categories.api';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import type { Transaction, Account, Category } from '../types';

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getInitialFormData = useCallback(() => ({
    amount: '',
    type: 'expense' as 'expense' | 'income',
    description: '',
    date: new Date().toISOString().split('T')[0],
    accountId: accounts.length > 0 ? accounts[0].id : '',
    categoryId: categories.find((c) => c.type === 'expense')?.id || '',
  }), [accounts, categories]);

  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'expense' | 'income',
    description: '',
    date: new Date().toISOString().split('T')[0],
    accountId: '',
    categoryId: '',
  });

  const loadData = useCallback(async () => {
    try {
      const [txData, accData, catData] = await Promise.all([
        transactionsApi.getAll({ limit: 50 }),
        accountsApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setTransactions(txData.transactions);
      setAccounts(accData);
      setCategories(catData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  const handleTypeChange = (type: 'expense' | 'income') => {
    const defaultCat = categories.find((c) => c.type === type);
    setFormData((prev) => ({
      ...prev,
      type,
      categoryId: defaultCat?.id || '',
    }));
  };

  const handleOpenForm = () => {
    // Resetear formulario con valores por defecto al abrir
    setFormData(getInitialFormData());
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    // Resetear formulario al cerrar
    setFormData(getInitialFormData());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transactionsApi.create({
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description || undefined,
        date: new Date(formData.date).toISOString(),
        accountId: formData.accountId,
        categoryId: formData.categoryId,
      });
      handleCloseForm();
      loadData();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await transactionsApi.delete(deleteId);
      setDeleteId(null);
      loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Transacciones</h1>
          <p className="text-gray-500">Historial de movimientos</p>
        </div>
        <Button onClick={handleOpenForm}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Transacción
        </Button>
      </div>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <Card key={tx.id} className="transition-all hover:shadow-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <CategoryIconBadge
                  icon={tx.category?.icon}
                  color={tx.category?.color}
                  size="lg"
                  tooltip={tx.category?.name}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {tx.category?.name}
                    </span>
                    {tx.fixedExpenseId && (
                      <Badge variant="secondary">Fijo</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {tx.description || tx.account?.name} • {formatDate(tx.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    'text-lg font-bold',
                    tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(Number(tx.amount))}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(tx.id)}
                  className="h-8 w-8 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {transactions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ArrowLeftRight className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No tienes transacciones. Añade una para empezar.</p>
              <Button onClick={handleOpenForm} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Crear primera transacción
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onClose={handleCloseForm}>
        <DialogHeader>
          <DialogTitle>Nueva Transacción</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogContent className="space-y-4">
            <div>
              <Label>Tipo</Label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={formData.type === 'expense' ? 'destructive' : 'outline'}
                  className="w-full"
                  onClick={() => handleTypeChange('expense')}
                >
                  <ArrowDownCircle className="mr-2 h-4 w-4" />
                  Gasto
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'income' ? 'success' : 'outline'}
                  className="w-full"
                  onClick={() => handleTypeChange('income')}
                >
                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                  Ingreso
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="account">Cuenta</Label>
              <Select
                id="account"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                required
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Categoría</Label>
              <CategorySelect
                categories={filteredCategories}
                value={formData.categoryId}
                onChange={(categoryId) => setFormData({ ...formData, categoryId })}
                required
              />
            </div>

            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input
                id="description"
                placeholder="Notas..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </DialogContent>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button type="submit">Crear</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar transacción"
        description="¿Estás seguro de eliminar esta transacción? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
