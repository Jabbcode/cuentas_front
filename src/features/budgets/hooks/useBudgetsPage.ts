import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useBudgets } from './useBudgets';
import { logger } from '../../../lib/logger';
import { budgetsApi } from '../api';
import { categoriesApi } from '../../categories/api';
import { getAvailableCategories, getPrevMonthYear, getNextMonthYear } from '../utils';
import type { Budget, Category } from '../../../types';
import type { BudgetFormData, UseBudgetsPageReturn } from '../types';

export function useBudgetsPage(): UseBudgetsPageReturn {
  const queryClient = useQueryClient();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { budgets, loading, reload, error: loadError } = useBudgets(month, year);

  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<BudgetFormData>({
    categoryId: '',
    amount: '',
    alertAt: '80',
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await categoriesApi.getAll('expense');
        if (!cancelled) setCategories(data);
      } catch {
        // silent
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const availableCategories = getAvailableCategories(categories, budgets, editingBudget);

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
        const available = getAvailableCategories(categories, budgets, null);
        setFormData({ categoryId: available[0]?.id ?? '', amount: '', alertAt: '80' });
      }
      setShowForm(true);
    },
    [categories, budgets]
  );

  const closeForm = useCallback(() => {
    setShowForm(false);
  }, []);

  const updateFormData = useCallback((data: Partial<BudgetFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSaving(true);
      try {
        const payload = {
          categoryId: formData.categoryId,
          amount: parseFloat(formData.amount),
          month,
          year,
          alertAt: formData.alertAt ? parseFloat(formData.alertAt) : undefined,
        };

        if (editingBudget) {
          await budgetsApi.update(editingBudget.id, payload);
          logger.info('budget', 'Budget updated', { id: editingBudget.id });
        } else {
          await budgetsApi.create(payload);
          logger.info('budget', 'Budget created', { categoryId: formData.categoryId, month, year });
        }

        setShowForm(false);
        await queryClient.invalidateQueries({ queryKey: ['budgets'] });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar');
        logger.error('budget', 'Failed to save budget', err);
      } finally {
        setSaving(false);
      }
    },
    [formData, month, year, editingBudget, queryClient]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await budgetsApi.delete(deleteId);
      logger.info('budget', 'Budget deleted', { id: deleteId });
      setDeleteId(null);
      await queryClient.invalidateQueries({ queryKey: ['budgets'] });
    } catch (err) {
      toast.error('No se pudo eliminar el presupuesto');
      logger.error('budget', 'Failed to delete budget', err, { id: deleteId });
    } finally {
      setDeleting(false);
    }
  }, [deleteId, queryClient]);

  const prevMonth = useCallback(() => {
    const next = getPrevMonthYear(month, year);
    setMonth(next.month);
    setYear(next.year);
  }, [month, year]);

  const nextMonth = useCallback(() => {
    const next = getNextMonthYear(month, year);
    setMonth(next.month);
    setYear(next.year);
  }, [month, year]);

  return {
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
  };
}
