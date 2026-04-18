import { useState, useEffect, useCallback } from 'react';
import { debtsApi } from '../api/debts.api';
import type { Debt } from '../types';

export function useDebts(status?: string) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDebts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await debtsApi.getAll(status);
      setDebts(data);
    } catch (err) {
      console.error('Error loading debts:', err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadDebts();
  }, [loadDebts]);

  const reload = useCallback(() => {
    loadDebts();
  }, [loadDebts]);

  const deleteDebt = useCallback(
    async (id: string) => {
      await debtsApi.delete(id);
      reload();
    },
    [reload]
  );

  const payDebt = useCallback(
    async (id: string, amount: number, accountId: string, notes?: string) => {
      await debtsApi.pay(id, { amount, accountId, notes });
      reload();
    },
    [reload]
  );

  return {
    debts,
    loading,
    reload,
    deleteDebt,
    payDebt,
  };
}
