import { useState, useEffect, useCallback } from 'react';
import { creditCardsApi } from '../api';
import { accountsApi } from '../../accounts/api';
import { logger } from '../../../lib/logger';
import type { CreditCardStatement, Account } from '../../../types';
import type { UseCreditCardsReturn } from '../types';

export function useCreditCards(): UseCreditCardsReturn {
  const [statements, setStatements] = useState<CreditCardStatement[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summary, allAccounts] = await Promise.all([
        creditCardsApi.getSummary(),
        accountsApi.getAll(),
      ]);
      setStatements(summary.cards);
      // Only non-credit card accounts can be used for payment
      setAccounts(allAccounts.filter((acc) => acc.type !== 'credit_card'));
    } catch (err) {
      setError('Error al cargar las tarjetas. Intenta de nuevo.');
      logger.error('credit-card', 'Failed to load credit cards', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const reload = useCallback(() => {
    loadData();
  }, [loadData]);

  return { statements, accounts, loading, error, reload };
}
