import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fixedExpensesApi } from '../api';
import { logger } from '../../../lib/logger';
import { getApiErrorMessage } from '../../../lib/api-errors';
import type { FixedExpenseSummary } from '../../../types';
import { toast } from 'sonner';
import type { UseFixedExpensesReturn } from '../types';

export function useFixedExpenses(): UseFixedExpensesReturn {
  const queryClient = useQueryClient();

  const query = useQuery<FixedExpenseSummary, Error>({
    queryKey: ['fixed-expenses'],
    queryFn: async () => {
      try {
        return await fixedExpensesApi.getSummary();
      } catch (err) {
        toast.error('No se pudieron cargar los gastos fijos');
        logger.error('fixed-expense', 'Failed to load fixed expenses', err);
        throw new Error('Error al cargar los gastos fijos. Intenta de nuevo.');
      }
    },
  });

  const payExpense = useCallback(
    async (id: string, amount?: number) => {
      try {
        await fixedExpensesApi.pay(id, amount ? { amount } : undefined);
        logger.info('fixed-expense', 'Fixed expense paid', { id, amount });
        await queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] });
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'No se pudo registrar el pago del gasto fijo'));
        logger.error('fixed-expense', 'Failed to pay fixed expense', err, { id });
      }
    },
    [queryClient]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      await fixedExpensesApi.delete(id);
      await queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] });
    },
    [queryClient]
  );

  const toggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        await fixedExpensesApi.update(id, { isActive: !isActive });
        logger.info('fixed-expense', 'Fixed expense toggled', { id, isActive: !isActive });
        await queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] });
      } catch (err) {
        toast.error('No se pudo actualizar el estado del gasto fijo');
        logger.error('fixed-expense', 'Failed to toggle fixed expense', err, { id });
      }
    },
    [queryClient]
  );

  return {
    summary: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    reload: () => {
      void query.refetch();
    },
    payExpense,
    deleteExpense,
    toggleActive,
  };
}
