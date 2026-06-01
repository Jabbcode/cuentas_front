import { useState, useEffect, useCallback } from 'react';
import { recurringDebtPaymentsApi } from '../api';
import { toast } from 'sonner';
import type { RecurringDebtPayment } from '../../../types';

export interface UseRecurringDebtPaymentsReturn {
  recurringPayments: RecurringDebtPayment[];
  loading: boolean;
  reload: () => void;
  deleteRecurringPayment: (id: string) => Promise<void>;
  toggleActive: (id: string, isActive: boolean) => Promise<void>;
}

export function useRecurringDebtPayments(debtId?: string): UseRecurringDebtPaymentsReturn {
  const [recurringPayments, setRecurringPayments] = useState<RecurringDebtPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecurringPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recurringDebtPaymentsApi.getAll(debtId);
      setRecurringPayments(data);
    } catch {
      toast.error('No se pudieron cargar los pagos recurrentes');
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

  return { recurringPayments, loading, reload, deleteRecurringPayment, toggleActive };
}
