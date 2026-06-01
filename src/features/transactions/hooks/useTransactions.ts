import { useState, useEffect, useCallback } from 'react';
import { transactionsApi } from '../api';
import { buildTransactionApiFilters } from '../utils';
import { toast } from 'sonner';
import type { Transaction } from '../../../types';

export interface UseTransactionsParams {
  currentPage: number;
  itemsPerPage: number;
  startDate?: string;
  endDate?: string;
  accountId?: string;
  type?: 'all' | 'expense' | 'income';
  tag?: string;
  categoryIds?: string[];
  minAmount?: string;
  maxAmount?: string;
}

export interface UseTransactionsReturn {
  transactions: Transaction[];
  total: number;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useTransactions(params: UseTransactionsParams): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = buildTransactionApiFilters(params);
      const txData = await transactionsApi.getAll(filters);
      setTransactions(txData.transactions);
      setTotal(txData.total);
    } catch {
      setError('Error al cargar las transacciones. Intenta de nuevo.');
      toast.error('No se pudieron cargar las transacciones');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.currentPage,
    params.itemsPerPage,
    params.startDate,
    params.endDate,
    params.accountId,
    params.type,
    params.tag,
    params.categoryIds?.join(','),
    params.minAmount,
    params.maxAmount,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const reload = useCallback(() => loadData(), [loadData]);

  return { transactions, total, loading, error, reload };
}
