import { useQuery } from '@tanstack/react-query';
import { budgetsApi } from '../api';
import type { Budget } from '../../../types';
import type { UseBudgetsReturn } from '../types';

export function useBudgets(month: number, year: number): UseBudgetsReturn {
  const query = useQuery<Budget[], Error>({
    queryKey: ['budgets', month, year],
    queryFn: async () => {
      try {
        return await budgetsApi.getAll(month, year);
      } catch (err) {
        throw err instanceof Error ? err : new Error('Error desconocido');
      }
    },
  });

  return {
    budgets: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    reload: () => {
      void query.refetch();
    },
  };
}
