import { useState, useCallback } from 'react';

export interface TransactionFilters {
  startDate: string;
  endDate: string;
  categoryIds: string[];
  accountId: string;
  minAmount: string;
  maxAmount: string;
  type: 'all' | 'expense' | 'income';
}

export function useTransactionFilters(onFilterChange?: () => void) {
  const [filters, setFilters] = useState<TransactionFilters>({
    startDate: '',
    endDate: '',
    categoryIds: [],
    accountId: 'all',
    minAmount: '',
    maxAmount: '',
    type: 'all',
  });

  const setStartDate = useCallback(
    (date: string) => {
      setFilters((prev) => ({ ...prev, startDate: date }));
      onFilterChange?.();
    },
    [onFilterChange]
  );

  const setEndDate = useCallback(
    (date: string) => {
      setFilters((prev) => ({ ...prev, endDate: date }));
      onFilterChange?.();
    },
    [onFilterChange]
  );

  const toggleCategory = useCallback(
    (categoryId: string) => {
      setFilters((prev) => {
        const exists = prev.categoryIds.includes(categoryId);
        return {
          ...prev,
          categoryIds: exists
            ? prev.categoryIds.filter((id) => id !== categoryId)
            : [...prev.categoryIds, categoryId],
        };
      });
      onFilterChange?.();
    },
    [onFilterChange]
  );

  const removeCategory = useCallback(
    (categoryId: string) => {
      setFilters((prev) => ({
        ...prev,
        categoryIds: prev.categoryIds.filter((id) => id !== categoryId),
      }));
      onFilterChange?.();
    },
    [onFilterChange]
  );

  const setAccountId = useCallback(
    (accountId: string) => {
      setFilters((prev) => ({ ...prev, accountId }));
      onFilterChange?.();
    },
    [onFilterChange]
  );

  const setMinAmount = useCallback((minAmount: string) => {
    setFilters((prev) => ({ ...prev, minAmount }));
  }, []);

  const setMaxAmount = useCallback((maxAmount: string) => {
    setFilters((prev) => ({ ...prev, maxAmount }));
  }, []);

  const setType = useCallback(
    (type: 'all' | 'expense' | 'income') => {
      setFilters((prev) => ({ ...prev, type }));
      onFilterChange?.();
    },
    [onFilterChange]
  );

  const clearFilters = useCallback(() => {
    setFilters({
      startDate: '',
      endDate: '',
      categoryIds: [],
      accountId: 'all',
      minAmount: '',
      maxAmount: '',
      type: 'all',
    });
    onFilterChange?.();
  }, [onFilterChange]);

  const hasActiveFilters =
    filters.startDate !== '' ||
    filters.endDate !== '' ||
    filters.categoryIds.length > 0 ||
    filters.accountId !== 'all' ||
    filters.minAmount !== '' ||
    filters.maxAmount !== '' ||
    filters.type !== 'all';

  return {
    filters,
    setStartDate,
    setEndDate,
    toggleCategory,
    removeCategory,
    setAccountId,
    setMinAmount,
    setMaxAmount,
    setType,
    clearFilters,
    hasActiveFilters,
  };
}
