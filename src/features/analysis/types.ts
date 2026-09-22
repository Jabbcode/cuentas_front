export interface SeriesPoint {
  month: string;
  total: number;
  count: number;
}

export interface CategorySeries {
  category: { id: string; name: string; icon: string | null; color: string | null };
  total: number;
  points: SeriesPoint[];
}

export interface CategoryMonthlySeriesResponse {
  months: string[];
  series: CategorySeries[];
}

export interface AnalysisFilters {
  startDate: string;
  endDate: string;
  type: 'expense' | 'income';
  /** Centinela 'all' = todas las cuentas, igual que useTransactionFilters. */
  accountId: string;
}

export type AnalysisEmptyState = 'no-data' | 'account-no-data' | 'no-selection' | 'error' | null;
