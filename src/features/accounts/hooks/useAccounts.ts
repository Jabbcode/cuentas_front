import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '../api';
import { logger } from '../../../lib/logger';
import type { Account } from '../../../types';

export function useAccounts() {
  const query = useQuery<Account[], Error>({
    queryKey: ['accounts'],
    queryFn: async () => {
      try {
        return await accountsApi.getAll();
      } catch (err) {
        logger.error('account', 'Failed to load accounts', err);
        throw new Error('Error al cargar las cuentas. Intenta de nuevo.');
      }
    },
  });

  return {
    accounts: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    reload: () => {
      void query.refetch();
    },
  };
}
