// UI-only types for the dashboard feature module.
// Domain model interfaces (DashboardSummary, CategorySummary, etc.) live in src/types/index.ts.

export interface UseDashboardReturn {
  summary: import('../../types').DashboardSummary | null;
  fixedSummary: import('../../types').FixedExpenseSummary | null;
  projection: import('../../types').ProjectionData | null;
  creditCardsSummary: import('../../types').CreditCardsSummary | null;
  debtsSummary: import('../../types').DebtsSummary | null;
  monthlyTrend: import('../../types').MonthlyTrend[];
  trendLoading: boolean;
  loading: boolean;
  reload: () => void;
}

export interface UseDashboardPageReturn {
  isAlertsOpen: boolean;
  isCreditCardsOpen: boolean;
  isDebtsOpen: boolean;
  isFixedOpen: boolean;
  isProjectionOpen: boolean;
  toggleAlerts: () => void;
  toggleCreditCards: () => void;
  toggleDebts: () => void;
  toggleFixed: () => void;
  toggleProjection: () => void;
}
