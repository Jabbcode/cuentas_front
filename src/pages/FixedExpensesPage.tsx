import { useState, useMemo } from 'react';
import { Plus, TrendingDown, TrendingUp, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { fixedExpensesApi } from '../api/fixed-expenses.api';
import { formatCurrency } from '../lib/utils';
import { useFixedExpenses } from '../hooks/useFixedExpenses';
import { FixedExpenseForm } from '../components/fixed-expenses/FixedExpenseForm';
import { FixedExpenseTable } from '../components/fixed-expenses/FixedExpenseTable';
import { MonthlyFixedSummary } from '../components/fixed-expenses/MonthlyFixedSummary';
import { CategoryIcon } from '../components/ui/category-icon';

type CategoryInfo = {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
};

export function FixedExpensesPage() {
  const { summary, loading, reload, payExpense, deleteExpense, toggleActive } = useFixedExpenses();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedExpenseCategories, setSelectedExpenseCategories] = useState<string[]>([]);
  const [selectedIncomeCategories, setSelectedIncomeCategories] = useState<string[]>([]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteExpense(deleteId);
      setDeleteId(null);
    } catch (error) {
    } finally {
      setDeleting(false);
    }
  };

  const toggleExpenseCategory = (categoryId: string) => {
    setSelectedExpenseCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleIncomeCategory = (categoryId: string) => {
    setSelectedIncomeCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearExpenseFilters = () => setSelectedExpenseCategories([]);
  const clearIncomeFilters = () => setSelectedIncomeCategories([]);

  // Obtener todas las categorías únicas de cada tipo (ANTES del early return)
  const expenseCategories = useMemo(() => {
    const categories = new Map<string, CategoryInfo>();
    summary?.items
      .filter((item) => item.type === 'expense' && item.category)
      .forEach((item) => {
        if (item.category && !categories.has(item.category.id)) {
          categories.set(item.category.id, item.category);
        }
      });
    return Array.from(categories.values());
  }, [summary]);

  const incomeCategories = useMemo(() => {
    const categories = new Map<string, CategoryInfo>();
    summary?.items
      .filter((item) => item.type === 'income' && item.category)
      .forEach((item) => {
        if (item.category && !categories.has(item.category.id)) {
          categories.set(item.category.id, item.category);
        }
      });
    return Array.from(categories.values());
  }, [summary]);

  // Filtrar items por categorías seleccionadas
  const expenseItems = useMemo(() => {
    const items = summary?.items.filter((item) => item.type === 'expense') || [];
    if (selectedExpenseCategories.length === 0) return items;
    return items.filter((item) => item.category && selectedExpenseCategories.includes(item.category.id));
  }, [summary, selectedExpenseCategories]);

  const incomeItems = useMemo(() => {
    const items = summary?.items.filter((item) => item.type === 'income') || [];
    if (selectedIncomeCategories.length === 0) return items;
    return items.filter((item) => item.category && selectedIncomeCategories.includes(item.category.id));
  }, [summary, selectedIncomeCategories]);

  // Calcular totales filtrados
  const filteredExpenseTotal = useMemo(() => {
    return expenseItems
      .filter((item) => item.isActive) // Solo contar activos
      .reduce((sum, item) => sum + Number(item.amount), 0);
  }, [expenseItems]);

  const filteredIncomeTotal = useMemo(() => {
    return incomeItems
      .filter((item) => item.isActive) // Solo contar activos
      .reduce((sum, item) => sum + Number(item.amount), 0);
  }, [incomeItems]);

  const handleReorder = async (newItems: any[]) => {
    if (!summary) return;

    try {
      // Persistir en el backend
      const itemsWithOrder = newItems.map((item, index) => ({
        id: item.id,
        sortOrder: index,
      }));
      await fixedExpensesApi.reorder(itemsWithOrder);
      reload();
    } catch (error) {
      // Recargar datos en caso de error para mantener consistencia
      reload();
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
          <h1 className="text-3xl font-bold text-gray-900">Gastos Fijos</h1>
          <p className="text-gray-500">
            Gestiona tus gastos e ingresos recurrentes mensuales
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Gasto Fijo
        </Button>
      </div>

      {/* Monthly Summary */}
      {summary && <MonthlyFixedSummary summary={summary} />}

      {/* Pending Payments Alert */}
      {summary && summary.pendingCount > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-orange-800">
                Tienes {summary.pendingCount} pago(s) pendiente(s) este mes
              </p>
              <p className="text-sm text-orange-600">
                Total pendiente: {formatCurrency(
                  expenseItems
                    .filter((item) => !item.isPaidThisMonth && item.isActive)
                    .reduce((sum, item) => sum + Number(item.amount), 0)
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fixed Expenses Tables */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
        {/* Gastos Table */}
        <div className="space-y-3">
          {/* Filtros de Gastos */}
          {expenseCategories.length > 0 && (
            <Card className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Filtrar por categoría</span>
                {selectedExpenseCategories.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearExpenseFilters}
                    className="h-7 text-xs"
                  >
                    Limpiar
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {expenseCategories.map((category) => {
                  const isSelected = selectedExpenseCategories.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleExpenseCategory(category.id)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all ${
                        isSelected
                          ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <CategoryIcon icon={category.icon} color={category.color} size="sm" />
                      <span>{category.name}</span>
                      {isSelected && <X className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          <FixedExpenseTable
          title="Gastos Fijos"
          items={expenseItems}
          type="expense"
          totalAmount={filteredExpenseTotal}
          icon={
            <div className="rounded-full bg-red-100 p-1.5">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          }
          onPay={payExpense}
          onEdit={(id) => setEditingId(id)}
          onDelete={(id) => setDeleteId(id)}
          onToggleActive={toggleActive}
          onReorder={handleReorder}
        />
        </div>

        {/* Ingresos Table */}
        <div className="space-y-3">
          {/* Filtros de Ingresos */}
          {incomeCategories.length > 0 && (
            <Card className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Filtrar por categoría</span>
                {selectedIncomeCategories.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearIncomeFilters}
                    className="h-7 text-xs"
                  >
                    Limpiar
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {incomeCategories.map((category) => {
                  const isSelected = selectedIncomeCategories.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleIncomeCategory(category.id)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all ${
                        isSelected
                          ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <CategoryIcon icon={category.icon} color={category.color} size="sm" />
                      <span>{category.name}</span>
                      {isSelected && <X className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          <FixedExpenseTable
          title="Ingresos Fijos"
          items={incomeItems}
          type="income"
          totalAmount={filteredIncomeTotal}
          icon={
            <div className="rounded-full bg-green-100 p-1.5">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          }
          onPay={payExpense}
          onEdit={(id) => setEditingId(id)}
          onDelete={(id) => setDeleteId(id)}
          onToggleActive={toggleActive}
          onReorder={handleReorder}
        />
        </div>
      </div>

      {/* Form Dialog */}
      {(showForm || editingId) && (
        <FixedExpenseForm
          editId={editingId}
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingId(null);
            reload();
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar gasto fijo"
        description="¿Estás seguro de eliminar este gasto fijo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
