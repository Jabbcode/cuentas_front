import { useState, useEffect, useCallback } from 'react';
import { accountsApi } from '../api';
import { logger } from '../../../lib/logger';
import type { Account } from '../../../types';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await accountsApi.getAll();
      setAccounts(data);
    } catch (err) {
      setError('Error al cargar las cuentas. Intenta de nuevo.');
      logger.error('account', 'Failed to load accounts', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const reload = useCallback(() => {
    loadAccounts();
  }, [loadAccounts]);

  return {
    accounts,
    loading,
    error,
    reload,
  };
}
