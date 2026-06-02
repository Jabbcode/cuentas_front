import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../api';
import { fixedExpensesApi } from '../../fixed-expenses';
import { creditCardsApi } from '../../credit-cards/api';
import { debtsApi } from '../../debts/api';
import type {
  DashboardSummary,
  FixedExpenseSummary,
  ProjectionData,
  CreditCardsSummary,
  DebtsSummary,
  MonthlyTrend,
} from '../../../types';
import type { UseDashboardReturn } from '../types';

interface DashboardData {
  summary: DashboardSummary;
  fixedSummary: FixedExpenseSummary;
  projection: ProjectionData;
  creditCardsSummary: CreditCardsSummary;
  debtsSummary: DebtsSummary;
}

export function useDashboard(): UseDashboardReturn {
  const queryClient = useQueryClient();

  const trendQuery = useQuery<MonthlyTrend[], Error>({
    queryKey: ['dashboard', 'trend'],
    queryFn: () => dashboardApi.getMonthlyTrend(6),
  });

  const query = useQuery<DashboardData, Error>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [sum, fixed, proj, ccSummary, debtSum] = await Promise.all([
        dashboardApi.getSummary(),
        fixedExpensesApi.getSummary(),
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
        fixedSummary: fixed,
        projection: proj,
        creditCardsSummary: ccSummary,
        debtsSummary: debtSum,
      };
    },
  });

  return {
    summary: query.data?.summary ?? null,
    fixedSummary: query.data?.fixedSummary ?? null,
    projection: query.data?.projection ?? null,
    creditCardsSummary: query.data?.creditCardsSummary ?? null,
    debtsSummary: query.data?.debtsSummary ?? null,
    monthlyTrend: trendQuery.data ?? [],
    trendLoading: trendQuery.isLoading,
    loading: query.isLoading,
    reload: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  };
}
