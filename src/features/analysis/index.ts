// Public API of the analysis feature module

// Types
export type {
  SeriesPoint,
  CategorySeries,
  CategoryMonthlySeriesResponse,
  AnalysisFilters,
  AnalysisEmptyState,
} from './types';

// API
export { analysisApi } from './api';

// Utils
export {
  MAX_SELECTED_CATEGORIES,
  CATEGORY_LINE_COLORS,
  getDefaultAnalysisRange,
  monthKeyToDateRange,
  formatMonthLabel,
  pickDefaultSelection,
  pruneSelection,
  isValidRange,
} from './utils';

// Hooks
export { useCategoryMonthlySeries } from './hooks/useCategoryMonthlySeries';
export type { UseCategoryMonthlySeriesReturn } from './hooks/useCategoryMonthlySeries';
export { useAnalysisPage } from './hooks/useAnalysisPage';
export type { UseAnalysisPageReturn, DateRange } from './hooks/useAnalysisPage';

// Components
export { AnalysisFiltersBar } from './components/AnalysisFiltersBar';
export { CategoryMultiSelect } from './components/CategoryMultiSelect';
export { CategoryTrendChart } from './components/CategoryTrendChart';
