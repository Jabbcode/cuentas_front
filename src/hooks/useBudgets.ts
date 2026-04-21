import { useState, useEffect, useCallback } from 'react';
import { budgetsApi } from '../api/budgets.api';
import type { Budget } from '../types';

export function useBudgets(month: number, year: number) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await budgetsApi.getAll(month, year);
      setBudgets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  return { budgets, loading, error, reload: loadBudgets };
}
