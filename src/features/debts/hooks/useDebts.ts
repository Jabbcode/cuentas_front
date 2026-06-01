import { useState, useEffect, useCallback } from 'react';
import { debtsApi } from '../api';
import { logger } from '../../../lib/logger';
import { toast } from 'sonner';
import type { Debt } from '../../../types';

export interface UseDebtsReturn {
  debts: Debt[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  deleteDebt: (id: string) => Promise<void>;
  payDebt: (id: string, amount: number, accountId: string, notes?: string) => Promise<void>;
}

export function useDebts(status?: string): UseDebtsReturn {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDebts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await debtsApi.getAll(status);
      setDebts(data);
    } catch (err) {
      setError('Error al cargar las deudas. Intenta de nuevo.');
      toast.error('No se pudieron cargar las deudas');
      logger.error('debt', 'Failed to load debts', err);
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

  return { debts, loading, error, reload, deleteDebt, payDebt };
}
