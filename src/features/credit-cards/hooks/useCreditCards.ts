import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { creditCardsApi } from '../api';
import { accountsApi } from '../../accounts/api';
import { logger } from '../../../lib/logger';
import { OVERDUE_MONTHS_DEFAULT } from '../utils';
import type { CreditCardStatement, Account, CreditCardsSummary } from '../../../types';
import type { UseCreditCardsReturn } from '../types';

export function useCreditCards(months: number = OVERDUE_MONTHS_DEFAULT): UseCreditCardsReturn {
  const statementsQuery = useQuery<CreditCardStatement[], Error>({
    queryKey: ['credit-card-statements', months],
    queryFn: async () => {
      try {
        const summary: CreditCardsSummary = await creditCardsApi.getSummary({ months });
        return summary.cards;
      } catch (err) {
        logger.error('credit-card', 'Failed to load credit cards', err);
        throw new Error('Error al cargar las tarjetas. Intenta de nuevo.');
      }
    },
    // Al cambiar `months` (nuevo queryKey) conserva los datos anteriores como
    // placeholder en vez de vaciar `data` y volver a poner isLoading en true.
    // Sin esto, CreditCardsPage desmonta la página entera (spinner de pantalla
    // completa, incluido el propio selector) en cada cambio de rango no cacheado
    // — con 12 meses eso puede tardar varios segundos, dando la sensación de que
    // el selector "no cambia" cuando en realidad solo está recargando.
    placeholderData: keepPreviousData,
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
