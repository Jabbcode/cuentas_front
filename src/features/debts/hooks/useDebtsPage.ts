import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useDebts } from './useDebts';
import { useRecurringDebtPayments } from './useRecurringDebtPayments';
import { groupDebtsByStatus, calculateDebtTotals, filterRecurringByDebt } from '../utils';
import type { Debt, RecurringDebtPayment } from '../../../types';
import type { UseDebtsPageReturn } from '../types';

export function useDebtsPage(): UseDebtsPageReturn {
  const { debts, loading, reload, deleteDebt, payDebt } = useDebts();
  const {
    recurringPayments,
    reload: reloadRecurring,
    deleteRecurringPayment,
    toggleActive,
  } = useRecurringDebtPayments();

  // Modal / selection state
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>();
  const [payingDebt, setPayingDebt] = useState<Debt | undefined>();
  const [viewingHistory, setViewingHistory] = useState<Debt | undefined>();
  const [configuringRecurring, setConfiguringRecurring] = useState<Debt | undefined>();
  const [editingRecurring, setEditingRecurring] = useState<RecurringDebtPayment | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteRecurringId, setDeleteRecurringId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Derived data
  const groups = groupDebtsByStatus(debts);
  const totals = calculateDebtTotals(groups);

  const getDebtRecurringPayments = useCallback(
    (debtId: string) => filterRecurringByDebt(recurringPayments, debtId),
    [recurringPayments]
  );

  // Form handlers
  const handleOpenCreate = useCallback(() => {
    setEditingDebt(undefined);
    setShowForm(true);
  }, []);

  const handleEditDebt = useCallback((debt: Debt) => {
    setEditingDebt(debt);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingDebt(undefined);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setShowForm(false);
    setEditingDebt(undefined);
    reload();
  }, [reload]);

  // Pay handlers
  const handlePay = useCallback(
    async (amount: number, accountId: string, notes?: string) => {
      if (!payingDebt) return;
      await payDebt(payingDebt.id, amount, accountId, notes);
    },
    [payingDebt, payDebt]
  );

  const handleSetPayingDebt = useCallback((debt: Debt) => {
    setPayingDebt(debt);
  }, []);

  const handleClosePay = useCallback(() => {
    setPayingDebt(undefined);
  }, []);

  // History handlers
  const handleViewHistory = useCallback((debt: Debt) => {
    setViewingHistory(debt);
  }, []);

  const handleCloseHistory = useCallback(() => {
    setViewingHistory(undefined);
  }, []);

  // Recurring payment handlers
  const handleOpenRecurring = useCallback((debt: Debt) => {
    setConfiguringRecurring(debt);
    setEditingRecurring(undefined);
  }, []);

  const handleEditRecurring = useCallback((rp: RecurringDebtPayment, debt: Debt) => {
    setEditingRecurring(rp);
    setConfiguringRecurring(debt);
  }, []);

  const handleCloseRecurring = useCallback(() => {
    setConfiguringRecurring(undefined);
    setEditingRecurring(undefined);
  }, []);

  const handleRecurringSuccess = useCallback(() => {
    setConfiguringRecurring(undefined);
    setEditingRecurring(undefined);
    reloadRecurring();
  }, [reloadRecurring]);

  // Delete debt handlers
  const handleRequestDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteDebt(deleteId);
      setDeleteId(null);
    } catch {
      toast.error('No se pudo eliminar la deuda');
    } finally {
      setDeleting(false);
    }
  }, [deleteId, deleteDebt]);

  const handleCancelDelete = useCallback(() => {
    setDeleteId(null);
  }, []);

  // Delete recurring handlers
  const handleRequestDeleteRecurring = useCallback((id: string) => {
    setDeleteRecurringId(id);
  }, []);

  const handleConfirmDeleteRecurring = useCallback(async () => {
    if (!deleteRecurringId) return;
    setDeleting(true);
    try {
      await deleteRecurringPayment(deleteRecurringId);
      setDeleteRecurringId(null);
    } catch {
      toast.error('No se pudo eliminar el pago recurrente');
    } finally {
      setDeleting(false);
    }
  }, [deleteRecurringId, deleteRecurringPayment]);

  const handleCancelDeleteRecurring = useCallback(() => {
    setDeleteRecurringId(null);
  }, []);

  return {
    debts,
    recurringPayments,
    loading,
    showForm,
    editingDebt,
    payingDebt,
    viewingHistory,
    configuringRecurring,
    editingRecurring,
    deleteId,
    deleteRecurringId,
    deleting,
    groups,
    totals,
    getDebtRecurringPayments,
    handleOpenCreate,
    handleEditDebt,
    handleCloseForm,
    handleFormSuccess,
    handlePay,
    handleClosePay,
    handleCloseHistory,
    handleOpenRecurring,
    handleEditRecurring,
    handleCloseRecurring,
    handleRecurringSuccess,
    handleRequestDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleRequestDeleteRecurring,
    handleConfirmDeleteRecurring,
    handleCancelDeleteRecurring,
    handleViewHistory,
    handleSetPayingDebt,
    toggleActive,
  };
}
