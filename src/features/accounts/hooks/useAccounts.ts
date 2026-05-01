import { useState, useEffect, useCallback } from 'react';
import { accountsApi } from '../api';
import type { Account } from '../../../types';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accountsApi.getAll();
      setAccounts(data);
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
    reload,
  };
}
