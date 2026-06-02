import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api';
import { getPrevMonth, calcDiffPct, mergeCategories } from '../utils';
import type { MonthComparison } from '../../../types';
import type { UseMonthComparisonReturn } from '../types';

export function useMonthComparison(): UseMonthComparisonReturn {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const query = useQuery<MonthComparison, Error>({
    queryKey: ['month-comparison', selectedMonth, selectedYear],
    queryFn: async () => {
      const prev = getPrevMonth(selectedMonth, selectedYear);
      const [current, previous] = await Promise.all([
        dashboardApi.getMonthlySummary(selectedMonth, selectedYear),
        dashboardApi.getMonthlySummary(prev.month, prev.year),
      ]);

      return {
        currentMonth: current,
        previousMonth: previous,
        expensesDiff: current.totalExpenses - previous.totalExpenses,
        expensesDiffPercentage: calcDiffPct(current.totalExpenses, previous.totalExpenses),
        incomeDiff: current.totalIncome - previous.totalIncome,
        incomeDiffPercentage: calcDiffPct(current.totalIncome, previous.totalIncome),
        netDiff: current.net - previous.net,
        categories: mergeCategories(current, previous),
      };
    },
  });

  const goToPrevMonth = useCallback(() => {
    const prev = getPrevMonth(selectedMonth, selectedYear);
    setSelectedMonth(prev.month);
    setSelectedYear(prev.year);
  }, [selectedMonth, selectedYear]);

  const goToNextMonth = useCallback(() => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  }, [selectedMonth, selectedYear]);

  const isCurrentMonth = selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();

  return {
    comparison: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    selectedMonth,
    selectedYear,
    goToPrevMonth,
    goToNextMonth,
    isCurrentMonth,
    reload: () => {
      void query.refetch();
    },
  };
}
