import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const query = useQuery<Debt[], Error>({
    queryKey: ['debts', status],
    queryFn: async () => {
      try {
        return await debtsApi.getAll(status);
      } catch (err) {
        toast.error('No se pudieron cargar las deudas');
        logger.error('debt', 'Failed to load debts', err);
        throw new Error('Error al cargar las deudas. Intenta de nuevo.');
      }
    },
  });

  const deleteDebt = useCallback(
    async (id: string) => {
      await debtsApi.delete(id);
      await queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
    [queryClient]
  );

  const payDebt = useCallback(
    async (id: string, amount: number, accountId: string, notes?: string) => {
      await debtsApi.pay(id, { amount, accountId, notes });
      await queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
    [queryClient]
  );

  return {
    debts: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    reload: () => {
      void query.refetch();
    },
    deleteDebt,
    payDebt,
  };
}
