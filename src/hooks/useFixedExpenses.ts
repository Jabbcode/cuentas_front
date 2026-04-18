import { useState, useEffect, useCallback } from 'react';
import { fixedExpensesApi } from '../api/fixed-expenses.api';
import type { FixedExpenseSummary } from '../types';

export function useFixedExpenses() {
  const [summary, setSummary] = useState<FixedExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fixedExpensesApi.getSummary();
      setSummary(data);
    } catch (err) {
      console.error('Error loading fixed expenses:', err);
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
      } catch (err) {
        console.error('Error paying expense:', err);
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
      } catch (err) {
        console.error('Error toggling active status:', err);
      }
    },
    [reload]
  );

  return {
    summary,
    loading,
    reload,
    payExpense,
    deleteExpense,
    toggleActive,
  };
}
