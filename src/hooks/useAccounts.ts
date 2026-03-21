import { useState, useEffect, useCallback } from 'react';
import { accountsApi } from '../api/accounts.api';
import type { Account } from '../types';

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

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  return {
    accounts,
    loading,
    reload,
    totalBalance,
  };
}
