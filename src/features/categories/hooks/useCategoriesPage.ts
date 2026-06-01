import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { categoriesApi } from '../api';
import { useCategories } from './useCategories';
import {
  buildCategoryPayload,
  buildFormDataFromCategory,
  filterCategoriesByType,
  DEFAULT_FORM_DATA,
} from '../utils';
import type { Category } from '../../../types';
import type { CategoryFormData, UseCategoriesPageReturn } from '../types';

export function useCategoriesPage(): UseCategoriesPageReturn {
  const { categories, loading, reload } = useCategories();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CategoryFormData>(DEFAULT_FORM_DATA);

  const expenseCategories = useMemo(
    () => filterCategoriesByType(categories, 'expense'),
    [categories]
  );

  const incomeCategories = useMemo(
    () => filterCategoriesByType(categories, 'income'),
    [categories]
  );

  const openForm = useCallback((category?: Category) => {
    setError('');
    if (category) {
      setEditingCategory(category);
      setFormData(buildFormDataFromCategory(category));
    } else {
      setEditingCategory(null);
      setFormData(DEFAULT_FORM_DATA);
    }
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingCategory(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSaving(true);
      try {
        const payload = buildCategoryPayload(formData);
        if (editingCategory) {
          await categoriesApi.update(editingCategory.id, payload);
        } else {
          await categoriesApi.create(payload);
        }
        setShowForm(false);
        reload();
      } catch {
        toast.error('No se pudo guardar la categoría');
      } finally {
        setSaving(false);
      }
    },
    [formData, editingCategory, reload]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await categoriesApi.delete(deleteId);
      setDeleteId(null);
      reload();
    } catch (err: unknown) {
      setDeleteId(null);
      if (err instanceof Error && err.message.includes('transacciones')) {
        setError('No se puede eliminar una categoría con transacciones asociadas');
      }
    } finally {
      setDeleting(false);
    }
  }, [deleteId, reload]);

  return {
    categories,
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
  };
}
