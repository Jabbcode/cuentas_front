import { useState, useEffect, useCallback } from 'react';
import { fixedExpensesApi } from '../api';
import { logger } from '../../../lib/logger';
import type { FixedExpenseSummary } from '../../../types';
import { toast } from 'sonner';
import type { UseFixedExpensesReturn } from '../types';

export function useFixedExpenses(): UseFixedExpensesReturn {
  const [summary, setSummary] = useState<FixedExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fixedExpensesApi.getSummary();
      setSummary(data);
    } catch (err) {
      setError('Error al cargar los gastos fijos. Intenta de nuevo.');
      toast.error('No se pudieron cargar los gastos fijos');
      logger.error('fixed-expense', 'Failed to load fixed expenses', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const reload = useCallback(() => {
    loadData();
  }, [loadData]);

  const payExpense = useCallback(
    async (id: string, amount?: number) => {
      try {
        await fixedExpensesApi.pay(id, amount ? { amount } : undefined);
        logger.info('fixed-expense', 'Fixed expense paid', { id, amount });
        reload();
      } catch (err) {
        toast.error('No se pudo registrar el pago del gasto fijo');
        logger.error('fixed-expense', 'Failed to pay fixed expense', err, { id });
      }
    },
    [reload]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      await fixedExpensesApi.delete(id);
      reload();
    },
    [reload]
  );

  const toggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        await fixedExpensesApi.update(id, { isActive: !isActive });
        logger.info('fixed-expense', 'Fixed expense toggled', { id, isActive: !isActive });
        reload();
      } catch (err) {
        toast.error('No se pudo actualizar el estado del gasto fijo');
        logger.error('fixed-expense', 'Failed to toggle fixed expense', err, { id });
      }
    },
    [reload]
  );

  return {
    summary,
    loading,
    error,
    reload,
    payExpense,
    deleteExpense,
    toggleActive,
  };
}
