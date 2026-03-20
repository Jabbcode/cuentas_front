import { useEffect, useState, useCallback } from 'react';
import { Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { fixedExpensesApi } from '../api/fixed-expenses.api';
import { formatCurrency } from '../lib/utils';
import type { FixedExpenseSummary } from '../types';
import { FixedExpenseForm } from '../components/fixed-expenses/FixedExpenseForm';
import { FixedExpenseTable } from '../components/fixed-expenses/FixedExpenseTable';
import { MonthlyFixedSummary } from '../components/fixed-expenses/MonthlyFixedSummary';

export function FixedExpensesPage() {
  const [summary, setSummary] = useState<FixedExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await fixedExpensesApi.getSummary();
      setSummary(data);
    } catch (error) {
      console.error('Error loading fixed expenses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePay = async (id: string, amount?: number) => {
    try {
      await fixedExpensesApi.pay(id, amount ? { amount } : undefined);
      loadData();
    } catch (error) {
      console.error('Error paying fixed expense:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fixedExpensesApi.delete(deleteId);
      setDeleteId(null);
      loadData();
    } catch (error) {
      console.error('Error deleting fixed expense:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fixedExpensesApi.update(id, { isActive: !isActive });
      loadData();
    } catch (error) {
      console.error('Error toggling fixed expense:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const expenseItems = summary?.items.filter((item) => item.type === 'expense') || [];
  const incomeItems = summary?.items.filter((item) => item.type === 'income') || [];

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
                    .filter((item) => !item.isPaidThisMonth)
                    .reduce((sum, item) => sum + item.amount, 0)
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fixed Expenses Tables */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
        {/* Gastos Table */}
        <FixedExpenseTable
          title="Gastos Fijos"
          items={expenseItems}
          type="expense"
          totalAmount={summary?.totalMonthlyExpenses || 0}
          icon={
            <div className="rounded-full bg-red-100 p-1.5">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          }
          onPay={handlePay}
          onEdit={(id) => setEditingId(id)}
          onDelete={(id) => setDeleteId(id)}
          onToggleActive={handleToggleActive}
        />

        {/* Ingresos Table */}
        <FixedExpenseTable
          title="Ingresos Fijos"
          items={incomeItems}
          type="income"
          totalAmount={summary?.totalMonthlyIncome || 0}
          icon={
            <div className="rounded-full bg-green-100 p-1.5">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          }
          onPay={handlePay}
          onEdit={(id) => setEditingId(id)}
          onDelete={(id) => setDeleteId(id)}
          onToggleActive={handleToggleActive}
        />
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
            loadData();
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
