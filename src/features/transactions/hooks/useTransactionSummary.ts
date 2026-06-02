import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../api';
import { toast } from 'sonner';
import type { TransactionCategorySummaryItem, TransactionSummaryFilters } from '../api';

export interface UseTransactionSummaryReturn {
  summary: TransactionCategorySummaryItem[];
  loading: boolean;
  reload: () => void;
}

export function useTransactionSummary(
  filters: TransactionSummaryFilters,
  enabled: boolean = true
): UseTransactionSummaryReturn {
  const query = useQuery<TransactionCategorySummaryItem[], Error>({
    queryKey: ['transaction-summary', filters],
    queryFn: async () => {
      try {
        return await transactionsApi.getSummary(filters);
      } catch {
        toast.error('No se pudo cargar el resumen de transacciones');
        throw new Error('Error al cargar el resumen de transacciones');
      }
    },
    enabled,
  });

  return {
    summary: query.data ?? [],
    loading: query.isLoading,
    reload: () => {
      void query.refetch();
    },
  };
}
