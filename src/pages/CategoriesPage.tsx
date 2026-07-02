import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ErrorCard } from '../components/ui/ErrorCard';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { CategoryList } from '../features/categories/components/CategoryList';
import { CategoryFormDialog } from '../features/categories/components/CategoryFormDialog';
import { useCategoriesPage } from '../features/categories/hooks/useCategoriesPage';

export function CategoriesPage() {
  const {
    expenseCategories,
    incomeCategories,
    loading,
    saving,
    deleting,
    showForm,
    editingCategory,
    deleteId,
    error,
    formData,
    openForm,
    closeForm,
    setFormData,
    handleSubmit,
    handleDelete,
    setDeleteId,
    reload,
    loadError,
  } = useCategoriesPage();

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
          <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-600">Organiza tus transacciones</p>
        </div>
        <Button onClick={() => openForm()}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryList
          items={expenseCategories}
          title="Gastos"
          onEdit={openForm}
          onDelete={setDeleteId}
        />
        <CategoryList
          items={incomeCategories}
          title="Ingresos"
          onEdit={openForm}
          onDelete={setDeleteId}
        />
      </div>

      <CategoryFormDialog
        open={showForm}
        editingCategory={editingCategory}
        formData={formData}
        saving={saving}
        error={error}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar categoría"
        description="¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
