import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { recurringDebtPaymentsApi } from '../api';
import { toast } from 'sonner';
import type { RecurringDebtPayment } from '../../../types';

export interface UseRecurringDebtPaymentsReturn {
  recurringPayments: RecurringDebtPayment[];
  loading: boolean;
  reload: () => void;
  deleteRecurringPayment: (id: string) => Promise<void>;
  toggleActive: (id: string, isActive: boolean) => Promise<void>;
}

export function useRecurringDebtPayments(debtId?: string): UseRecurringDebtPaymentsReturn {
  const queryClient = useQueryClient();

  const query = useQuery<RecurringDebtPayment[], Error>({
    queryKey: ['recurring-debt-payments', debtId],
    queryFn: async () => {
      try {
        return await recurringDebtPaymentsApi.getAll(debtId);
      } catch {
        toast.error('No se pudieron cargar los pagos recurrentes');
        throw new Error('Error al cargar los pagos recurrentes');
      }
    },
  });

  const deleteRecurringPayment = useCallback(
    async (id: string) => {
      await recurringDebtPaymentsApi.delete(id);
      await queryClient.invalidateQueries({ queryKey: ['recurring-debt-payments', debtId] });
    },
    [queryClient, debtId]
  );

  const toggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      await recurringDebtPaymentsApi.update(id, { isActive });
      await queryClient.invalidateQueries({ queryKey: ['recurring-debt-payments', debtId] });
    },
    [queryClient, debtId]
  );

  return {
    recurringPayments: query.data ?? [],
    loading: query.isLoading,
    reload: () => {
      void query.refetch();
    },
    deleteRecurringPayment,
    toggleActive,
  };
}
