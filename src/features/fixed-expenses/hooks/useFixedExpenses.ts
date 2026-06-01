import { useState, useEffect, useCallback } from 'react';
import { fixedExpensesApi } from '../api';
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
    } catch {
      setError('Error al cargar los gastos fijos. Intenta de nuevo.');
      toast.error('No se pudieron cargar los gastos fijos');
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
        reload();
      } catch {
        toast.error('No se pudo registrar el pago del gasto fijo');
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
        reload();
      } catch {
        toast.error('No se pudo actualizar el estado del gasto fijo');
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
