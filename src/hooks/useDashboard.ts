import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../api/dashboard.api';
import { fixedExpensesApi } from '../api/fixed-expenses.api';
import { creditCardsApi } from '../api/credit-cards.api';
import { debtsApi } from '../api/debts.api';
import type {
  DashboardSummary,
  CategorySummary,
  FixedExpenseSummary,
  FixedVsVariable,
  ProjectionData,
  CreditCardsSummary,
  DebtsSummary
} from '../types';

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [byCategory, setByCategory] = useState<CategorySummary[]>([]);
  const [fixedSummary, setFixedSummary] = useState<FixedExpenseSummary | null>(null);
  const [fixedVsVariable, setFixedVsVariable] = useState<FixedVsVariable | null>(null);
  const [projection, setProjection] = useState<ProjectionData | null>(null);
  const [creditCardsSummary, setCreditCardsSummary] = useState<CreditCardsSummary | null>(null);
  const [debtsSummary, setDebtsSummary] = useState<DebtsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sum, cat, fixed, fvv, proj, ccSummary, debtSum] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getByCategory('expense'),
        fixedExpensesApi.getSummary(),
        dashboardApi.getFixedVsVariable(),
        dashboardApi.getNextMonthProjection(),
        creditCardsApi.getSummary().catch(() => ({
          totalToPay: 0,
          upcomingPayments: [],
          alerts: [],
          cards: []
        })),
        debtsApi.getSummary().catch(() => ({
          totalActiveDebts: 0,
          totalOverdueDebts: 0,
          totalDebtAmount: 0,
          totalOverdueAmount: 0,
          debtsDueSoon: 0,
          upcomingDebts: []
        })),
      ]);

      setSummary(sum);
      setByCategory(cat);
      setFixedSummary(fixed);
      setFixedVsVariable(fvv);
      setProjection(proj);
      setCreditCardsSummary(ccSummary);
      setDebtsSummary(debtSum);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Reload when tab becomes visible (user returns to the page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadData]);

  const reload = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    summary,
    byCategory,
    fixedSummary,
    fixedVsVariable,
    projection,
    creditCardsSummary,
    debtsSummary,
    loading,
    reload,
  };
}
