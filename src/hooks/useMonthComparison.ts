import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../api/dashboard.api';
import type { MonthlySummary, CategoryComparison, MonthComparison } from '../types';

function getPrevMonth(month: number, year: number): { month: number; year: number } {
  if (month === 1) return { month: 12, year: year - 1 };
  return { month: month - 1, year };
}

function calcDiffPct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function mergeCategories(current: MonthlySummary, previous: MonthlySummary): CategoryComparison[] {
  const map = new Map<string, CategoryComparison>();

  current.categories.forEach((cat) => {
    map.set(cat.id, {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      current: cat.total,
      previous: 0,
      diff: cat.total,
      diffPercentage: null,
      trend: 'up',
    });
  });

  previous.categories.forEach((cat) => {
    if (map.has(cat.id)) {
      const entry = map.get(cat.id)!;
      const diff = entry.current - cat.total;
      map.set(cat.id, {
        ...entry,
        previous: cat.total,
        diff,
        diffPercentage: calcDiffPct(entry.current, cat.total),
        trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
      });
    } else {
      map.set(cat.id, {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        current: 0,
        previous: cat.total,
        diff: -cat.total,
        diffPercentage: -100,
        trend: 'down',
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => b.current - a.current);
}

export function useMonthComparison() {
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
