import { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboard.api';
import { fixedExpensesApi } from '../api/fixed-expenses.api';
import { creditCardsApi } from '../api/credit-cards.api';
import type {
  DashboardSummary,
  CategorySummary,
  FixedExpenseSummary,
  FixedVsVariable,
  ProjectionData,
  CreditCardsSummary
} from '../types';

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [byCategory, setByCategory] = useState<CategorySummary[]>([]);
  const [fixedSummary, setFixedSummary] = useState<FixedExpenseSummary | null>(null);
  const [fixedVsVariable, setFixedVsVariable] = useState<FixedVsVariable | null>(null);
  const [projection, setProjection] = useState<ProjectionData | null>(null);
  const [creditCardsSummary, setCreditCardsSummary] = useState<CreditCardsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.getSummary(),
      dashboardApi.getByCategory('expense'),
      fixedExpensesApi.getSummary(),
      dashboardApi.getFixedVsVariable(),
      dashboardApi.getNextMonthProjection(),
      creditCardsApi.getSummary().catch(() => ({ totalToPay: 0, upcomingPayments: [], alerts: [], cards: [] })),
    ])
      .then(([sum, cat, fixed, fvv, proj, ccSummary]) => {
        setSummary(sum);
        setByCategory(cat);
        setFixedSummary(fixed);
        setFixedVsVariable(fvv);
        setProjection(proj);
        setCreditCardsSummary(ccSummary);
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    summary,
    byCategory,
    fixedSummary,
    fixedVsVariable,
    projection,
    creditCardsSummary,
    loading,
  };
}
