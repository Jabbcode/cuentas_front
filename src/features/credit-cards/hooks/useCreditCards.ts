import { useQuery } from '@tanstack/react-query';
import { creditCardsApi } from '../api';
import { accountsApi } from '../../accounts/api';
import { logger } from '../../../lib/logger';
import type { CreditCardStatement, Account, CreditCardsSummary } from '../../../types';
import type { UseCreditCardsReturn } from '../types';

export function useCreditCards(): UseCreditCardsReturn {
  const statementsQuery = useQuery<CreditCardStatement[], Error>({
    queryKey: ['credit-card-statements'],
    queryFn: async () => {
      try {
        const summary: CreditCardsSummary = await creditCardsApi.getSummary();
        return summary.cards;
      } catch (err) {
        logger.error('credit-card', 'Failed to load credit cards', err);
        throw new Error('Error al cargar las tarjetas. Intenta de nuevo.');
      }
    },
  });

  const accountsQuery = useQuery<Account[], Error>({
    queryKey: ['accounts'],
    queryFn: async () => {
      try {
        const all = await accountsApi.getAll();
        return all.filter((acc) => acc.type !== 'credit_card');
      } catch (err) {
        logger.error('credit-card', 'Failed to load accounts for credit cards', err);
        throw new Error('Error al cargar las cuentas. Intenta de nuevo.');
      }
    },
  });

  const error = statementsQuery.error?.message ?? accountsQuery.error?.message ?? null;

  return {
    statements: statementsQuery.data ?? [],
    accounts: accountsQuery.data ?? [],
    loading: statementsQuery.isLoading || accountsQuery.isLoading,
    error,
    reload: () => {
      void statementsQuery.refetch();
      void accountsQuery.refetch();
    },
  };
}
