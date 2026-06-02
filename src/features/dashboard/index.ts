// Public API of the dashboard feature module

// Types
export type { UseDashboardReturn, UseDashboardPageReturn } from './types';

// API
export { dashboardApi } from './api';

// Utils
export {
  getPrevMonth,
  calcDiffPct,
  mergeCategories,
  calcDaysLeftInMonth,
  calcSpentPercentage,
  calcDaysUntilDueDay,
  filterUpcomingFixedExpenses,
  hasAlerts,
  CREDIT_UTILIZATION_ALERT_THRESHOLD,
  UPCOMING_PAYMENTS_DAYS_WINDOW,
} from './utils';

// Hooks
export { useDashboard } from './hooks/useDashboard';
export { useDashboardPage } from './hooks/useDashboardPage';

// Components
export { DashboardHeroCard } from './components/DashboardHeroCard';
export { DashboardAlertsSection } from './components/DashboardAlertsSection';
export { MonthlyTrendChart } from './components/MonthlyTrendChart';
export { DashboardSummaryCards } from './components/DashboardSummaryCards';
export { FixedExpensesSummaryCard } from './components/FixedExpensesSummaryCard';
export { NextMonthProjection } from './components/NextMonthProjection';
export { CreditCardsSummaryCard } from './components/CreditCardsSummary';
export { DebtsSummaryCard } from './components/DebtsSummaryCard';
