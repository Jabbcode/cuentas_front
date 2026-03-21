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
    } catch (error) {
      console.error('Error loading fixed expenses:', error);
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

  const payExpense = useCallback(async (id: string, amount?: number) => {
    try {
      await fixedExpensesApi.pay(id, amount ? { amount } : undefined);
      reload();
    } catch (error) {
      console.error('Error paying fixed expense:', error);
    }
  }, [reload]);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      await fixedExpensesApi.delete(id);
      reload();
    } catch (error) {
      console.error('Error deleting fixed expense:', error);
      throw error;
    }
  }, [reload]);

  const toggleActive = useCallback(async (id: string, isActive: boolean) => {
    try {
      await fixedExpensesApi.update(id, { isActive: !isActive });
      reload();
    } catch (error) {
      console.error('Error toggling fixed expense:', error);
    }
  }, [reload]);

  return {
    summary,
    loading,
    reload,
    payExpense,
    deleteExpense,
    toggleActive,
  };
}
