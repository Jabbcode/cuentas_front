// Public API of the budgets feature module

// Types
export type {
  BudgetFormData,
  UseBudgetsReturn,
  UseBudgetsPageReturn,
  UseBudgetWidgetReturn,
} from './types';

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
export { useBudgetWidget } from './hooks/useBudgetWidget';

// Components (feature-owned)
export { BudgetProgressBar } from './components/BudgetProgressBar';
export { BudgetDashboardWidget } from './components/BudgetDashboardWidget';
export { BudgetCard } from './components/BudgetCard';
export { BudgetFormDialog } from './components/BudgetFormDialog';
