import { useState, useMemo } from 'react';
import { Plus, TrendingDown, TrendingUp, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
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

  // Filtrar items por categorías seleccionadas y ordenar por fecha de pago
  const expenseItems = useMemo(() => {
    const items = summary?.items.filter((item) =>
      item.type === 'expense' &&
      !item.creditCardAccountId &&
      !item.recurringDebtPaymentId
    ) || [];
    const filtered = selectedExpenseCategories.length === 0
      ? items
      : items.filter((item) => item.category && selectedExpenseCategories.includes(item.category.id));

    // Ordenar por fecha de pago (dueDay)
    return filtered.sort((a, b) => a.dueDay - b.dueDay);
  }, [summary, selectedExpenseCategories]);

  const incomeItems = useMemo(() => {
    const items = summary?.items.filter((item) => item.type === 'income') || [];
    const filtered = selectedIncomeCategories.length === 0
      ? items
      : items.filter((item) => item.category && selectedIncomeCategories.includes(item.category.id));

    // Ordenar por fecha de pago (dueDay)
    return filtered.sort((a, b) => a.dueDay - b.dueDay);
  }, [summary, selectedIncomeCategories]);

  // Credit Card items (separate from regular expenses)
  const creditCardItems = useMemo(() => {
    const items = summary?.items.filter((item) => item.creditCardAccountId) || [];
    return items.sort((a, b) => a.dueDay - b.dueDay);
  }, [summary]);

  // Recurring Debt Payment items (separate from regular expenses)
  const debtPaymentItems = useMemo(() => {
    const items = summary?.items.filter((item) => item.recurringDebtPaymentId) || [];
    return items.sort((a, b) => a.dueDay - b.dueDay);
  }, [summary]);

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

      {/* Credit Card Fixed Expenses Section */}
      {creditCardItems.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-purple-100 p-1.5">
                <svg className="h-4 w-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-purple-900">Tarjetas de Crédito</h3>
                <p className="text-xs text-purple-700">
                  Pagos programados de tus tarjetas (se actualizan automáticamente)
                </p>
              </div>
            </div>
          </div>

          <FixedExpenseTable
            title="Pagos de Tarjetas"
            items={creditCardItems}
            type="expense"
            totalAmount={creditCardItems
              .filter((item) => item.isActive)
              .reduce((sum, item) => sum + Number(item.amount), 0)}
            icon={
              <div className="rounded-full bg-purple-100 p-1.5">
                <svg className="h-4 w-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                </svg>
              </div>
            }
            onPay={payExpense}
            onEdit={(id) => setEditingId(id)}
            onDelete={(id) => setDeleteId(id)}
            onToggleActive={toggleActive}
          />
        </div>
      )}

      {/* Recurring Debt Payments Section */}
      {debtPaymentItems.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-orange-100 p-1.5">
                <span className="text-lg">💰</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-900">Pagos de Deudas</h3>
                <p className="text-xs text-orange-700">
                  Pagos recurrentes mensuales de tus deudas
                </p>
              </div>
            </div>
          </div>

          <FixedExpenseTable
            title="Pagos de Deudas"
            items={debtPaymentItems}
            type="expense"
            totalAmount={debtPaymentItems
              .filter((item) => item.isActive)
              .reduce((sum, item) => sum + Number(item.amount), 0)}
            icon={
              <div className="rounded-full bg-orange-100 p-1.5">
                <span className="text-base">💰</span>
              </div>
            }
            onPay={payExpense}
            onEdit={(id) => setEditingId(id)}
            onDelete={(id) => setDeleteId(id)}
            onToggleActive={toggleActive}
          />
        </div>
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
