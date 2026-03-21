import { useState, useEffect, useCallback } from 'react';
import { transactionsApi } from '../api/transactions.api';
import { accountsApi } from '../api/accounts.api';
import { categoriesApi } from '../api/categories.api';
import { buildTransactionFilters } from '../lib/transaction-utils';
import type { Transaction, Account, Category } from '../types';

export interface UseTransactionsParams {
  currentPage: number;
  itemsPerPage: number;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: 'all' | 'expense' | 'income';
}

export function useTransactions(params: UseTransactionsParams) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = buildTransactionFilters(params);

      const [txData, accData, catData] = await Promise.all([
        transactionsApi.getAll(filters),
        accountsApi.getAll(),
        categoriesApi.getAll(),
      ]);

      setTransactions(txData.transactions);
      setTotal(txData.total);
      setAccounts(accData);
      setCategories(catData);
    } finally {
      setLoading(false);
    }
  }, [
    params.currentPage,
    params.itemsPerPage,
    params.startDate,
    params.endDate,
    params.categoryId,
    params.type,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const reload = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    transactions,
    total,
    accounts,
    categories,
    loading,
    reload,
  };
}
