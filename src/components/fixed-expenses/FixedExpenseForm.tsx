import { useEffect, useState } from 'react';
import { CreditCard, Info } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { CategorySelect } from '../ui/category-select';
import { fixedExpensesApi } from '../../api/fixed-expenses.api';
import { accountsApi } from '../../api/accounts.api';
import { categoriesApi } from '../../api/categories.api';
import type { Account, Category } from '../../types';

interface FixedExpenseFormProps {
  editId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function FixedExpenseForm({ editId, onClose, onSuccess }: FixedExpenseFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'expense' as 'expense' | 'income',
    dueDay: '1',
    description: '',
    accountId: '',
    categoryId: '',
  });

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [accountsData, categoriesData] = await Promise.all([
          accountsApi.getAll(),
          categoriesApi.getAll(),
        ]);
        setAccounts(accountsData);
        setCategories(categoriesData);

        if (accountsData.length > 0) {
          setFormData((prev) => ({ ...prev, accountId: accountsData[0].id }));
        }

        if (editId) {
          const expense = await fixedExpensesApi.getById(editId);
          setFormData({
            name: expense.name,
            amount: expense.amount.toString(),
            type: expense.type as 'expense' | 'income',
            dueDay: expense.dueDay.toString(),
            description: expense.description || '',
            accountId: expense.accountId,
            categoryId: expense.categoryId,
          });
        } else {
          const defaultCategory = categoriesData.find((c) => c.type === 'expense');
          if (defaultCategory) {
            setFormData((prev) => ({ ...prev, categoryId: defaultCategory.id }));
          }
        }
      } catch (error) {
      } finally {
        setLoadingData(false);
      }
    };

    loadFormData();
  }, [editId]);

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  const handleTypeChange = (type: 'expense' | 'income') => {
    setFormData((prev) => ({
      ...prev,
      type,
      categoryId: categories.find((c) => c.type === type)?.id || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        type: formData.type,
        dueDay: parseInt(formData.dueDay),
        description: formData.description || undefined,
        accountId: formData.accountId,
        categoryId: formData.categoryId,
      };

      if (editId) {
        await fixedExpensesApi.update(editId, data);
      } else {
        await fixedExpensesApi.create(data);
      }

      onSuccess();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Dialog open onClose={onClose}>
        <DialogContent className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onClose={onClose}>
      <DialogHeader>
        <DialogTitle>
          {editId ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-4">
          {/* Type Toggle */}
          <div>
            <Label>Tipo</Label>
            <div className="mt-1 flex gap-2">
              <Button
                type="button"
                variant={formData.type === 'expense' ? 'destructive' : 'outline'}
                className="flex-1"
                onClick={() => handleTypeChange('expense')}
              >
                Gasto
              </Button>
              <Button
                type="button"
                variant={formData.type === 'income' ? 'success' : 'outline'}
                className="flex-1"
                onClick={() => handleTypeChange('income')}
              >
                Ingreso
              </Button>
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Ej: Netflix, Alquiler, Salario"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Amount */}
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

          {/* Due Day */}
          <div>
            <Label htmlFor="dueDay">Día del mes</Label>
            <Select
              id="dueDay"
              value={formData.dueDay}
              onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  Día {day}
                </option>
              ))}
            </Select>
          </div>

          {/* Account */}
          <div>
            <Label htmlFor="account">Cuenta</Label>
            <Select
              id="account"
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              required
            >
              <option value="">Seleccionar cuenta</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} {account.type === 'credit_card' ? '(Tarjeta)' : ''}
                </option>
              ))}
            </Select>
            {/* Credit Card Info */}
            {formData.accountId && accounts.find((a) => a.id === formData.accountId)?.type === 'credit_card' && (
              <div className="mt-2 rounded-lg border border-purple-200 bg-purple-50 p-3">
                <div className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-purple-800">
                    <p className="font-medium mb-1">Cargo a Tarjeta de Crédito</p>
                    {accounts.find((a) => a.id === formData.accountId)?.cutoffDay ? (
                      <p>
                        Este gasto se cargará al período que cierra el día{' '}
                        <span className="font-medium">
                          {accounts.find((a) => a.id === formData.accountId)?.cutoffDay}
                        </span>{' '}
                        de cada mes.
                      </p>
                    ) : (
                      <div className="flex items-start gap-1">
                        <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
                        <p>
                          Configura las fechas de corte y pago en la cuenta para habilitar el seguimiento de períodos.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <Label>Categoría</Label>
            <CategorySelect
              categories={filteredCategories}
              value={formData.categoryId}
              onChange={(categoryId) => setFormData({ ...formData, categoryId })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              placeholder="Notas adicionales..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : editId ? 'Guardar Cambios' : 'Crear'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
