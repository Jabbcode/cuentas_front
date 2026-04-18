import { useState, useEffect, useCallback } from 'react';
import { recurringDebtPaymentsApi } from '../api/recurring-debt-payments.api';
import type { RecurringDebtPayment } from '../types';

export function useRecurringDebtPayments(debtId?: string) {
  const [recurringPayments, setRecurringPayments] = useState<RecurringDebtPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecurringPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recurringDebtPaymentsApi.getAll(debtId);
      setRecurringPayments(data);
    } catch (err) {
      console.error('Error loading recurring payments:', err);
    } finally {
      setLoading(false);
    }
  }, [debtId]);

  useEffect(() => {
    loadRecurringPayments();
  }, [loadRecurringPayments]);

  const reload = useCallback(() => {
    loadRecurringPayments();
  }, [loadRecurringPayments]);

  const deleteRecurringPayment = useCallback(
    async (id: string) => {
      await recurringDebtPaymentsApi.delete(id);
      reload();
    },
    [reload]
  );

  const toggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      await recurringDebtPaymentsApi.update(id, { isActive });
      reload();
    },
    [reload]
  );

  return {
    recurringPayments,
    loading,
    reload,
    deleteRecurringPayment,
    toggleActive,
  };
}
