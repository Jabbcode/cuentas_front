// Public API of the fixed-expenses feature module

// Types (UI/form — domain models live in src/types/index.ts)
export type {
  CategoryInfo,
  FixedExpenseWithStatus,
  UseFixedExpensesReturn,
  UseFixedExpensesPageReturn,
} from './types';

// API
export { fixedExpensesApi } from './api';

// Utils
export {
  getExpenseCategories,
  getIncomeCategories,
  getFilteredExpenseItems,
  getFilteredIncomeItems,
  getCreditCardItems,
  getDebtPaymentItems,
  sumActiveAmounts,
  toggleCategorySelection,
} from './utils';

// Hooks
export { useFixedExpenses } from './hooks/useFixedExpenses';
export { useFixedExpensesPage } from './hooks/useFixedExpensesPage';

// Components
export { CategoryFilter } from './components/CategoryFilter';
export { FixedExpenseCard } from './components/FixedExpenseCard';
export { FixedExpenseForm } from './components/FixedExpenseForm';
export { FixedExpenseTable } from './components/FixedExpenseTable';
export { MonthlyFixedSummary } from './components/MonthlyFixedSummary';
