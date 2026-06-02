import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api';
import { fixedExpensesApi } from '../../fixed-expenses';
import { creditCardsApi } from '../../credit-cards/api';
import { debtsApi } from '../../debts/api';
import type {
  DashboardSummary,
  CategorySummary,
  FixedExpenseSummary,
  FixedVsVariable,
  ProjectionData,
  CreditCardsSummary,
  DebtsSummary,
} from '../../../types';
import type { UseDashboardReturn } from '../types';

interface DashboardData {
  summary: DashboardSummary;
  byCategory: CategorySummary[];
  fixedSummary: FixedExpenseSummary;
  fixedVsVariable: FixedVsVariable;
  projection: ProjectionData;
  creditCardsSummary: CreditCardsSummary;
  debtsSummary: DebtsSummary;
}

export function useDashboard(): UseDashboardReturn {
  const query = useQuery<DashboardData, Error>({
    queryKey: ['dashboard'],
    queryFn: async () => {
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
          cards: [],
        })),
        debtsApi.getSummary().catch(() => ({
          totalActiveDebts: 0,
          totalOverdueDebts: 0,
          totalDebtAmount: 0,
          totalOverdueAmount: 0,
          debtsDueSoon: 0,
          upcomingDebts: [],
        })),
      ]);

      return {
        summary: sum,
        byCategory: cat,
        fixedSummary: fixed,
        fixedVsVariable: fvv,
        projection: proj,
        creditCardsSummary: ccSummary,
        debtsSummary: debtSum,
      };
    },
  });

  return {
    summary: query.data?.summary ?? null,
    byCategory: query.data?.byCategory ?? [],
    fixedSummary: query.data?.fixedSummary ?? null,
    fixedVsVariable: query.data?.fixedVsVariable ?? null,
    projection: query.data?.projection ?? null,
    creditCardsSummary: query.data?.creditCardsSummary ?? null,
    debtsSummary: query.data?.debtsSummary ?? null,
    loading: query.isLoading,
    reload: () => {
      void query.refetch();
    },
  };
}
