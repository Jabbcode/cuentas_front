import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../api';
import { buildTransactionApiFilters } from '../utils';
import { logger } from '../../../lib/logger';
import { toast } from 'sonner';
import type { Transaction, TransactionsResponse } from '../../../types';

export interface UseTransactionsParams {
  currentPage: number;
  itemsPerPage: number;
  startDate?: string;
  endDate?: string;
  accountId?: string;
  type?: 'all' | 'expense' | 'income';
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
  const query = useQuery<TransactionsResponse, Error>({
    queryKey: [
      'transactions',
      params.currentPage,
      params.itemsPerPage,
      params.startDate,
      params.endDate,
      params.accountId,
      params.type,
      params.categoryIds?.join(','),
      params.minAmount,
      params.maxAmount,
    ],
    queryFn: async () => {
      try {
        const filters = buildTransactionApiFilters(params);
        return await transactionsApi.getAll(filters);
      } catch (err) {
        toast.error('No se pudieron cargar las transacciones');
        logger.error('transaction', 'Failed to load transactions', err);
        throw new Error('Error al cargar las transacciones. Intenta de nuevo.');
      }
    },
  });

  return {
    transactions: query.data?.transactions ?? [],
    total: query.data?.total ?? 0,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    reload: () => {
      void query.refetch();
    },
  };
}
