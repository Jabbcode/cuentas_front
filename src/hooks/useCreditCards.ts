import { useState, useEffect, useCallback } from 'react';
import { creditCardsApi } from '../api/credit-cards.api';
import { accountsApi } from '../api/accounts.api';
import type { CreditCardStatement, Account } from '../types';

export function useCreditCards() {
  const [statements, setStatements] = useState<CreditCardStatement[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [summary, allAccounts] = await Promise.all([
        creditCardsApi.getSummary(),
        accountsApi.getAll(),
      ]);
      setStatements(summary.cards);
      // Only non-credit card accounts can be used for payment
      setAccounts(allAccounts.filter((acc) => acc.type !== 'credit_card'));
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

  return {
    statements,
    accounts,
    loading,
    reload,
  };
}
