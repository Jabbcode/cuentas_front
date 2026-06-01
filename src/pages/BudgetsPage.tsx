import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ErrorCard } from '../components/ui/ErrorCard';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { useBudgetsPage } from '../features/budgets/hooks/useBudgetsPage';
import { BudgetCard } from '../features/budgets/components/BudgetCard';
import { BudgetEmpty } from '../features/budgets/components/BudgetEmpty';
import { BudgetFormDialog } from '../features/budgets/components/BudgetFormDialog';
import { getMonthLabel } from '../features/budgets/utils';

export function BudgetsPage() {
  const {
    budgets,
    categories,
    loading,
    saving,
    deleting,
    month,
    year,
    showForm,
    editingBudget,
    deleteId,
    formData,
    error,
    availableCategories,
    openForm,
    closeForm,
    setDeleteId,
    handleSubmit,
    handleDelete,
    prevMonth,
    nextMonth,
    updateFormData,
    reload,
    loadError,
  } = useBudgetsPage();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
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
          <h1 className="text-3xl font-bold text-gray-900">Presupuestos</h1>
          <p className="text-gray-500">Control de gasto mensual por categoría</p>
        </div>
        <Button onClick={() => openForm()} disabled={availableCategories.length === 0}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Presupuesto
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[160px] text-center text-lg font-semibold text-gray-900">
          {getMonthLabel(month)} {year}
        </span>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {budgets.length === 0 ? (
        <BudgetEmpty onAction={availableCategories.length > 0 ? () => openForm() : undefined} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} onEdit={openForm} onDelete={setDeleteId} />
          ))}
        </div>
      )}

      <BudgetFormDialog
        open={showForm}
        editingBudget={editingBudget}
        categories={categories}
        availableCategories={availableCategories}
        formData={formData}
        saving={saving}
        error={error}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onFormDataChange={updateFormData}
      />

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
