import { useState, useCallback, useEffect } from 'react';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '../components/ui/dialog';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { BudgetProgressBar } from '../components/budgets/BudgetProgressBar';
import { CategoryIcon } from '../components/ui/category-icon';
import { budgetsApi } from '../api/budgets.api';
import { categoriesApi } from '../features/categories/api';
import { useBudgets } from '../hooks/useBudgets';
import { formatCurrency, cn } from '../lib/utils';
import type { Budget, Category } from '../types';

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { budgets, loading, reload } = useBudgets(month, year);

  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    alertAt: '80',
  });

  useEffect(() => {
    categoriesApi.getAll('expense').then(setCategories);
  }, []);

  const budgetedCategoryIds = new Set(budgets.map((b) => b.categoryId));
  const availableCategories = editingBudget
    ? categories
    : categories.filter((c) => !budgetedCategoryIds.has(c.id));

  const openForm = useCallback(
    (budget?: Budget) => {
      setError('');
      if (budget) {
        setEditingBudget(budget);
        setFormData({
          categoryId: budget.categoryId,
          amount: budget.amount.toString(),
          alertAt: (budget.alertAt ?? 80).toString(),
        });
      } else {
        setEditingBudget(null);
        setFormData({ categoryId: availableCategories[0]?.id ?? '', amount: '', alertAt: '80' });
      }
      setShowForm(true);
    },
    [availableCategories]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const data = {
        categoryId: formData.categoryId,
        amount: parseFloat(formData.amount),
        month,
        year,
        alertAt: formData.alertAt ? parseFloat(formData.alertAt) : undefined,
      };

      if (editingBudget) {
        await budgetsApi.update(editingBudget.id, data);
      } else {
        await budgetsApi.create(data);
      }

      setShowForm(false);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await budgetsApi.delete(deleteId);
      setDeleteId(null);
      reload();
    } finally {
      setDeleting(false);
    }
  };

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
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
          <h1 className="text-3xl font-bold text-gray-900">Presupuestos</h1>
          <p className="text-gray-500">Control de gasto mensual por categoría</p>
        </div>
        <Button onClick={() => openForm()} disabled={availableCategories.length === 0}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Presupuesto
        </Button>
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[160px] text-center text-lg font-semibold text-gray-900">
          {MONTHS[month - 1]} {year}
        </span>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              No hay presupuestos para {MONTHS[month - 1]} {year}.
            </p>
            {availableCategories.length > 0 && (
              <Button className="mt-4" onClick={() => openForm()}>
                <Plus className="mr-2 h-4 w-4" /> Crear presupuesto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <Card
              key={budget.id}
              className={cn(
                budget.isOverBudget && 'border-red-200',
                budget.isNearLimit && !budget.isOverBudget && 'border-yellow-200'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryIcon
                      icon={budget.category.icon}
                      color={budget.category.color}
                      size="md"
                    />
                    <CardTitle className="text-base">{budget.category.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openForm(budget)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-600"
                      onClick={() => setDeleteId(budget.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <BudgetProgressBar
                  spent={budget.spent}
                  amount={budget.amount}
                  percentage={budget.percentage}
                  isOverBudget={budget.isOverBudget}
                  isNearLimit={budget.isNearLimit}
                />
                {!budget.isOverBudget && (
                  <p className="mt-2 text-xs text-gray-500">
                    Disponible: {formatCurrency(budget.remaining)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onClose={() => setShowForm(false)}>
        <DialogHeader>
          <DialogTitle>{editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogContent className="space-y-4">
            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            <div>
              <Label htmlFor="categoryId">Categoría</Label>
              <Select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                disabled={!!editingBudget}
                required
              >
                <option value="">Selecciona una categoría</option>
                {(editingBudget ? categories : availableCategories).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Presupuesto (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ej: 500"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="alertAt">Alerta al (% del presupuesto)</Label>
              <Input
                id="alertAt"
                type="number"
                step="1"
                min="0"
                max="100"
                placeholder="80"
                value={formData.alertAt}
                onChange={(e) => setFormData({ ...formData, alertAt: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">
                Alerta visual cuando el gasto supera este porcentaje.
              </p>
            </div>
          </DialogContent>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editingBudget ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar presupuesto"
        description="¿Estás seguro de eliminar este presupuesto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
