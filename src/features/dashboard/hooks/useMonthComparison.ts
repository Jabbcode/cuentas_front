import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../api';
import { getPrevMonth, calcDiffPct, mergeCategories } from '../utils';
import type { MonthComparison } from '../../../types';
import type { UseMonthComparisonReturn } from '../types';

export function useMonthComparison(): UseMonthComparisonReturn {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [comparison, setComparison] = useState<MonthComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const prev = getPrevMonth(selectedMonth, selectedYear);
      const [current, previous] = await Promise.all([
        dashboardApi.getMonthlySummary(selectedMonth, selectedYear),
        dashboardApi.getMonthlySummary(prev.month, prev.year),
      ]);

      setComparison({
        currentMonth: current,
        previousMonth: previous,
        expensesDiff: current.totalExpenses - previous.totalExpenses,
        expensesDiffPercentage: calcDiffPct(current.totalExpenses, previous.totalExpenses),
        incomeDiff: current.totalIncome - previous.totalIncome,
        incomeDiffPercentage: calcDiffPct(current.totalIncome, previous.totalIncome),
        netDiff: current.net - previous.net,
        categories: mergeCategories(current, previous),
      });
    } catch {
      setError('Error cargando comparativa');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    comparison,
    loading,
    error,
    selectedMonth,
    selectedYear,
    goToPrevMonth,
    goToNextMonth,
    isCurrentMonth,
    reload: loadData,
  };
}
