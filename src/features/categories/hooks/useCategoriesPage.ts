import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api';
import { useCategories } from './useCategories';
import {
  buildCategoryPayload,
  buildFormDataFromCategory,
  filterCategoriesByType,
  DEFAULT_FORM_DATA,
} from '../utils';
import { logger } from '../../../lib/logger';
import type { Category } from '../../../types';
import type { CategoryFormData, UseCategoriesPageReturn } from '../types';

export function useCategoriesPage(): UseCategoriesPageReturn {
  const queryClient = useQueryClient();
  const { categories, loading, reload, error: loadError } = useCategories();

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
          logger.info('category', 'Category updated', {
            id: editingCategory.id,
            name: formData.name,
          });
        } else {
          await categoriesApi.create(payload);
          logger.info('category', 'Category created', { name: formData.name });
        }
        setShowForm(false);
        await queryClient.invalidateQueries({ queryKey: ['categories'] });
      } catch (err) {
        toast.error('No se pudo guardar la categoría');
        logger.error('category', 'Failed to save category', err, { name: formData.name });
      } finally {
        setSaving(false);
      }
    },
    [formData, editingCategory, queryClient]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await categoriesApi.delete(deleteId);
      logger.info('category', 'Category deleted', { id: deleteId });
      setDeleteId(null);
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (err: unknown) {
      setDeleteId(null);
      logger.error('category', 'Failed to delete category', err, { id: deleteId });
      if (err instanceof Error && err.message.includes('transacciones')) {
        setError('No se puede eliminar una categoría con transacciones asociadas');
      }
    } finally {
      setDeleting(false);
    }
  }, [deleteId, queryClient]);

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
    reload,
    loadError,
  };
}
