import { useState, useEffect, useCallback } from 'react';
import { transactionsApi } from '../api';
import { accountsApi } from '../../accounts/api';
import { categoriesApi } from '../../categories/api';
import { buildTransactionApiFilters } from '../utils';
import type { Transaction, Account, Category } from '../../../types';

export interface UseTransactionsParams {
  currentPage: number;
  itemsPerPage: number;
  startDate?: string;
  endDate?: string;
  accountId?: string;
  type?: 'all' | 'expense' | 'income';
  tag?: string;
}

export interface UseTransactionsReturn {
  transactions: Transaction[];
  total: number;
  accounts: Account[];
  categories: Category[];
  loading: boolean;
  reload: () => void;
}

export function useTransactions(params: UseTransactionsParams): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = buildTransactionApiFilters(params);

      const [txData, accData, catData] = await Promise.all([
        transactionsApi.getAll(filters),
        accountsApi.getAll(),
        categoriesApi.getAll(),
      ]);

      setTransactions(txData.transactions);
      setTotal(txData.total);
      setAccounts(accData);
      setCategories(catData);
    } catch (err) {
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.currentPage,
    params.itemsPerPage,
    params.startDate,
    params.endDate,
    params.accountId,
    params.type,
    params.tag,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const reload = useCallback(() => {
    loadData();
  }, [loadData]);

  return { transactions, total, accounts, categories, loading, reload };
}
