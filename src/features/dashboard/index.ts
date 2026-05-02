// Public API of the dashboard feature module

// Types
export type { UseDashboardReturn, UseMonthComparisonReturn } from './types';

// API
export { dashboardApi } from './api';

// Utils
export { getPrevMonth, calcDiffPct, mergeCategories } from './utils';

// Hooks
export { useDashboard } from './hooks/useDashboard';
export { useMonthComparison } from './hooks/useMonthComparison';

// Components
export { DashboardSummaryCards } from './components/DashboardSummaryCards';
export { FixedExpensesSummaryCard } from './components/FixedExpensesSummaryCard';
export { ExpensesByCategoryChart } from './components/ExpensesByCategoryChart';
export { FixedVsVariableChart } from './components/FixedVsVariableChart';
export { NextMonthProjection } from './components/NextMonthProjection';
export { CreditCardsSummaryCard } from './components/CreditCardsSummary';
export { DebtsSummaryCard } from './components/DebtsSummaryCard';
export { MonthComparisonCard } from './components/MonthComparisonCard';
export { CategoryComparisonChart } from './components/CategoryComparisonChart';
export { MonthSelector } from './components/MonthSelector';
