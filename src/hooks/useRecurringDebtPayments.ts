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
    } catch (error) {
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

  const deleteRecurringPayment = useCallback(async (id: string) => {
    try {
      await recurringDebtPaymentsApi.delete(id);
      reload();
    } catch (error) {
      throw error;
    }
  }, [reload]);

  const toggleActive = useCallback(async (id: string, isActive: boolean) => {
    try {
      await recurringDebtPaymentsApi.update(id, { isActive });
      reload();
    } catch (error) {
      throw error;
    }
  }, [reload]);

  return {
    recurringPayments,
    loading,
    reload,
    deleteRecurringPayment,
    toggleActive,
  };
}
