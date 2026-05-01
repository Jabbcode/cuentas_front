// Public API of the budgets feature module

// Types
export type { BudgetFormData, UseBudgetsReturn, UseBudgetsPageReturn } from './types';

// API
export { budgetsApi } from './api';

// Utils
export {
  MONTHS,
  getMonthLabel,
  getPrevMonthYear,
  getNextMonthYear,
  getAvailableCategories,
} from './utils';

// Hooks
export { useBudgets } from './hooks/useBudgets';
export { useBudgetsPage } from './hooks/useBudgetsPage';

// Components (feature-owned)
export { BudgetProgressBar } from './components/BudgetProgressBar';
export { BudgetDashboardWidget } from './components/BudgetDashboardWidget';
export { BudgetCard } from './components/BudgetCard';
export { BudgetFormDialog } from './components/BudgetFormDialog';
