import { useState, useCallback } from 'react';

export interface TransactionFilters {
  startDate: string;
  endDate: string;
  categoryId: string;
  type: 'all' | 'expense' | 'income';
  groupByCategory: boolean;
}

export function useTransactionFilters(onFilterChange?: () => void) {
  const [filters, setFilters] = useState<TransactionFilters>({
    startDate: '',
    endDate: '',
    categoryId: 'all',
    type: 'all',
    groupByCategory: false,
  });

  const setStartDate = useCallback((date: string) => {
    setFilters((prev) => ({ ...prev, startDate: date }));
    onFilterChange?.();
  }, [onFilterChange]);

  const setEndDate = useCallback((date: string) => {
    setFilters((prev) => ({ ...prev, endDate: date }));
    onFilterChange?.();
  }, [onFilterChange]);

  const setCategoryId = useCallback((categoryId: string) => {
    setFilters((prev) => ({ ...prev, categoryId }));
    onFilterChange?.();
  }, [onFilterChange]);

  const setType = useCallback((type: 'all' | 'expense' | 'income') => {
    setFilters((prev) => ({ ...prev, type }));
    onFilterChange?.();
  }, [onFilterChange]);

  const setGroupByCategory = useCallback((groupByCategory: boolean) => {
    setFilters((prev) => ({ ...prev, groupByCategory }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      startDate: '',
      endDate: '',
      categoryId: 'all',
      type: 'all',
      groupByCategory: false,
    });
    onFilterChange?.();
  }, [onFilterChange]);

  const hasActiveFilters =
    filters.startDate !== '' ||
    filters.endDate !== '' ||
    filters.categoryId !== 'all' ||
    filters.type !== 'all';

  return {
    filters,
    setStartDate,
    setEndDate,
    setCategoryId,
    setType,
    setGroupByCategory,
    clearFilters,
    hasActiveFilters,
  };
}
