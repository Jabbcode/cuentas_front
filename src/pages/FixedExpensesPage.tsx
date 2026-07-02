import { Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ErrorCard } from '../components/ui/ErrorCard';
import { Card, CardContent } from '../components/ui/card';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { formatCurrency } from '../lib/utils';
import {
  useFixedExpensesPage,
  CategoryFilter,
  FixedExpenseForm,
  FixedExpenseTable,
  MonthlyFixedSummary,
} from '../features/fixed-expenses';

const CREDIT_CARD_ICON = (
  <div className="rounded-full bg-purple-100 p-1.5">
    <svg className="h-4 w-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
      <path
        fillRule="evenodd"
        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
        clipRule="evenodd"
      />
    </svg>
  </div>
);

const DEBT_ICON = (
  <div className="rounded-full bg-amber-100 p-1.5">
    <span className="text-base">💰</span>
  </div>
);

export function FixedExpensesPage() {
  const {
    summary,
    loading,
    showForm,
    editingId,
    deleteId,
    deleting,
    selectedExpenseCategories,
    selectedIncomeCategories,
    expenseCategories,
    incomeCategories,
    expenseItems,
    incomeItems,
    creditCardItems,
    debtPaymentItems,
    filteredExpenseTotal,
    filteredIncomeTotal,
    creditCardTotal,
    debtPaymentTotal,
    pendingAmount,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormSuccess,
    requestDelete,
    cancelDelete,
    handleDelete,
    payExpense,
    toggleActive,
    toggleExpenseCategory,
    toggleIncomeCategory,
    clearExpenseFilters,
    clearIncomeFilters,
    reload,
    loadError,
  } = useFixedExpensesPage();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 motion-safe:animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (loadError) {
    return <ErrorCard message={loadError} onRetry={reload} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gastos Fijos</h1>
          <p className="text-gray-600">Gestiona tus gastos e ingresos recurrentes mensuales</p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Gasto Fijo
        </Button>
      </div>

      {summary && <MonthlyFixedSummary summary={summary} />}

      {summary && summary.pendingCount > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <p className="font-medium text-amber-800">
              Tienes {summary.pendingCount} pago(s) pendiente(s) este mes
            </p>
            <p className="text-sm text-amber-600">
              Total pendiente: {formatCurrency(pendingAmount)}
            </p>
          </CardContent>
        </Card>
      )}

      {creditCardItems.length > 0 && (
        <FixedExpenseTable
          title="Pagos de Tarjetas"
          items={creditCardItems}
          type="expense"
          totalAmount={creditCardTotal}
          icon={CREDIT_CARD_ICON}
          onPay={payExpense}
          onEdit={openEditForm}
          onDelete={requestDelete}
          onToggleActive={toggleActive}
        />
      )}

      {debtPaymentItems.length > 0 && (
        <FixedExpenseTable
          title="Pagos de Deudas"
          items={debtPaymentItems}
          type="expense"
          totalAmount={debtPaymentTotal}
          icon={DEBT_ICON}
          onPay={payExpense}
          onEdit={openEditForm}
          onDelete={requestDelete}
          onToggleActive={toggleActive}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="space-y-3">
          <CategoryFilter
            categories={expenseCategories}
            selected={selectedExpenseCategories}
            onToggle={toggleExpenseCategory}
            onClear={clearExpenseFilters}
          />
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
            onEdit={openEditForm}
            onDelete={requestDelete}
            onToggleActive={toggleActive}
          />
        </div>

        <div className="space-y-3">
          <CategoryFilter
            categories={incomeCategories}
            selected={selectedIncomeCategories}
            onToggle={toggleIncomeCategory}
            onClear={clearIncomeFilters}
          />
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
            onEdit={openEditForm}
            onDelete={requestDelete}
            onToggleActive={toggleActive}
          />
        </div>
      </div>

      {(showForm || editingId) && (
        <FixedExpenseForm editId={editingId} onClose={closeForm} onSuccess={handleFormSuccess} />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={cancelDelete}
        onConfirm={handleDelete}
        title="Eliminar gasto fijo"
        description="¿Estas seguro de eliminar este gasto fijo? Esta accion no se puede deshacer."
        confirmText="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
