import { useEffect, useState } from 'react';
import { CreditCard, Info, Zap } from 'lucide-react';
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
import { CategorySelect } from '../../../components/ui/category-select';
import { fixedExpensesApi } from '../api';
import { accountsApi } from '../../accounts/api';
import { categoriesApi } from '../../categories/api';
import type { Account, Category } from '../../../types';

export interface FixedExpenseFormProps {
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
    creditCardAccountId: null as string | null,
    autoGenerate: false,
  });

  useEffect(() => {
    let cancelled = false;
    const loadFormData = async () => {
      try {
        const [accountsData, categoriesData] = await Promise.all([
          accountsApi.getAll(),
          categoriesApi.getAll(),
        ]);
        if (cancelled) return;
        setAccounts(accountsData);
        setCategories(categoriesData);
        if (accountsData.length > 0) {
          setFormData((prev) => ({ ...prev, accountId: accountsData[0].id }));
        }
        if (editId) {
          const expense = await fixedExpensesApi.getById(editId);
          if (cancelled) return;
          setFormData({
            name: expense.name,
            amount: expense.amount.toString(),
            type: expense.type as 'expense' | 'income',
            dueDay: expense.dueDay.toString(),
            description: expense.description ?? '',
            accountId: expense.accountId,
            categoryId: expense.categoryId,
            creditCardAccountId: expense.creditCardAccountId ?? null,
            autoGenerate: expense.autoGenerate ?? false,
          });
        } else {
          const defaultCategory = categoriesData.find((c) => c.type === 'expense');
          if (defaultCategory) {
            setFormData((prev) => ({ ...prev, categoryId: defaultCategory.id }));
          }
        }
      } catch (err) {
        console.error('Error loading form data:', err);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };
    loadFormData();
    return () => {
      cancelled = true;
    };
  }, [editId]);

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  const handleTypeChange = (type: 'expense' | 'income') => {
    setFormData((prev) => ({
      ...prev,
      type,
      categoryId: categories.find((c) => c.type === type)?.id ?? '',
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
        autoGenerate: formData.autoGenerate,
      };

      if (editId) {
        await fixedExpensesApi.update(editId, data);
      } else {
        await fixedExpensesApi.create(data);
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving fixed expense:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Dialog open onClose={onClose}>
        <DialogContent className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 motion-safe:animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{editId ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo'}</DialogTitle>
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

          {/* Due Day - Hidden for credit card syncd expenses */}
          {!formData.creditCardAccountId && (
            <div>
              <Label htmlFor="dueDay">Dia del mes</Label>
              <Select
                id="dueDay"
                value={formData.dueDay}
                onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    Dia {day}
                  </option>
                ))}
              </Select>
            </div>
          )}

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
            {formData.accountId &&
              accounts.find((a) => a.id === formData.accountId)?.type === 'credit_card' && (
                <div className="mt-2 rounded-lg border border-purple-200 bg-purple-50 p-3">
                  <div className="flex items-start gap-2">
                    <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                    <div className="text-xs text-purple-800">
                      <p className="mb-1 font-medium">Cargo a Tarjeta de Credito</p>
                      {accounts.find((a) => a.id === formData.accountId)?.cutoffDay ? (
                        <p>
                          Este gasto se cargara al periodo que cierra el dia{' '}
                          <span className="font-medium">
                            {accounts.find((a) => a.id === formData.accountId)?.cutoffDay}
                          </span>{' '}
                          de cada mes.
                        </p>
                      ) : (
                        <div className="flex items-start gap-1">
                          <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
                          <p>
                            Configura las fechas de corte y pago en la cuenta para habilitar el
                            seguimiento de periodos.
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
            <Label>Categoria</Label>
            <CategorySelect
              categories={filteredCategories}
              value={formData.categoryId}
              onChange={(categoryId) => setFormData({ ...formData, categoryId })}
              required
            />
          </div>

          {/* Auto-generate toggle */}
          <div className="flex items-start justify-between rounded-lg border border-gray-200 p-3">
            <div className="flex items-start gap-2">
              <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Auto-generar transaccion</p>
                <p className="text-xs text-gray-600">
                  Se creara automaticamente en el dia {formData.dueDay} de cada mes
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, autoGenerate: !prev.autoGenerate }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.autoGenerate ? 'bg-amber-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.autoGenerate ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Descripcion (opcional)</Label>
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
