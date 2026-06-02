import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '../../../lib/logger';
import { useFixedExpenses } from './useFixedExpenses';
import {
  getExpenseCategories,
  getIncomeCategories,
  getFilteredExpenseItems,
  getFilteredIncomeItems,
  getCreditCardItems,
  getDebtPaymentItems,
  sumActiveAmounts,
  toggleCategorySelection,
} from '../utils';
import type { UseFixedExpensesPageReturn } from '../types';

export function useFixedExpensesPage(): UseFixedExpensesPageReturn {
  const queryClient = useQueryClient();
  const {
    summary,
    loading,
    reload,
    error: loadError,
    payExpense,
    deleteExpense,
    toggleActive,
  } = useFixedExpenses();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedExpenseCategories, setSelectedExpenseCategories] = useState<string[]>([]);
  const [selectedIncomeCategories, setSelectedIncomeCategories] = useState<string[]>([]);

  // --- Derived data ---
  const expenseCategories = useMemo(() => getExpenseCategories(summary), [summary]);
  const incomeCategories = useMemo(() => getIncomeCategories(summary), [summary]);

  const expenseItems = useMemo(
    () => getFilteredExpenseItems(summary, selectedExpenseCategories),
    [summary, selectedExpenseCategories]
  );

  const incomeItems = useMemo(
    () => getFilteredIncomeItems(summary, selectedIncomeCategories),
    [summary, selectedIncomeCategories]
  );

  const creditCardItems = useMemo(() => getCreditCardItems(summary), [summary]);
  const debtPaymentItems = useMemo(() => getDebtPaymentItems(summary), [summary]);

  const filteredExpenseTotal = useMemo(() => sumActiveAmounts(expenseItems), [expenseItems]);
  const filteredIncomeTotal = useMemo(() => sumActiveAmounts(incomeItems), [incomeItems]);
  const creditCardTotal = useMemo(() => sumActiveAmounts(creditCardItems), [creditCardItems]);
  const debtPaymentTotal = useMemo(() => sumActiveAmounts(debtPaymentItems), [debtPaymentItems]);
  const pendingAmount = useMemo(
    () =>
      expenseItems
        .filter((i) => !i.isPaidThisMonth && i.isActive)
        .reduce((sum, i) => sum + Number(i.amount), 0),
    [expenseItems]
  );

  // --- Handlers ---
  const openCreateForm = useCallback(() => {
    setShowForm(true);
    setEditingId(null);
  }, []);

  const openEditForm = useCallback((id: string) => {
    setEditingId(id);
    setShowForm(false);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    void queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] });
  }, [queryClient]);

  const requestDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteId(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteExpense(deleteId);
      logger.info('fixed-expense', 'Fixed expense deleted', { id: deleteId });
      setDeleteId(null);
    } catch (err) {
      toast.error('No se pudo eliminar el gasto fijo');
      logger.error('fixed-expense', 'Failed to delete fixed expense', err, { id: deleteId });
    } finally {
      setDeleting(false);
    }
  }, [deleteId, deleteExpense]);

  const toggleExpenseCategory = useCallback((categoryId: string) => {
    setSelectedExpenseCategories((prev) => toggleCategorySelection(prev, categoryId));
  }, []);

  const toggleIncomeCategory = useCallback((categoryId: string) => {
    setSelectedIncomeCategories((prev) => toggleCategorySelection(prev, categoryId));
  }, []);

  const clearExpenseFilters = useCallback(() => setSelectedExpenseCategories([]), []);
  const clearIncomeFilters = useCallback(() => setSelectedIncomeCategories([]), []);

  return {
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
    pendingAmount,
    reload,
    loadError,
  };
}
