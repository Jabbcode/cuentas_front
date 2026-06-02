// UI-only types for the dashboard feature module.
// Domain model interfaces (DashboardSummary, CategorySummary, etc.) live in src/types/index.ts.

export interface UseDashboardReturn {
  summary: import('../../types').DashboardSummary | null;
  byCategory: import('../../types').CategorySummary[];
  fixedSummary: import('../../types').FixedExpenseSummary | null;
  fixedVsVariable: import('../../types').FixedVsVariable | null;
  projection: import('../../types').ProjectionData | null;
  creditCardsSummary: import('../../types').CreditCardsSummary | null;
  debtsSummary: import('../../types').DebtsSummary | null;
  loading: boolean;
  reload: () => void;
}

export interface UseMonthComparisonReturn {
  comparison: import('../../types').MonthComparison | null;
  loading: boolean;
  error: string | null;
  selectedMonth: number;
  selectedYear: number;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  isCurrentMonth: boolean;
  reload: () => void;
}
