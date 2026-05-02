import type { FixedExpense, FixedExpenseSummary } from '../../types';

// ---- UI / Form types (domain models live in src/types/index.ts) ----

export type CategoryInfo = {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
};

export type FixedExpenseWithStatus = FixedExpense & { isPaidThisMonth: boolean };

export interface UseFixedExpensesReturn {
  summary: FixedExpenseSummary | null;
  loading: boolean;
  reload: () => void;
  payExpense: (id: string, amount?: number) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  toggleActive: (id: string, isActive: boolean) => Promise<void>;
}

export interface UseFixedExpensesPageReturn {
  summary: FixedExpenseSummary | null;
  loading: boolean;
  showForm: boolean;
  editingId: string | null;
  deleteId: string | null;
  deleting: boolean;
  selectedExpenseCategories: string[];
  selectedIncomeCategories: string[];
  expenseCategories: CategoryInfo[];
  incomeCategories: CategoryInfo[];
  expenseItems: FixedExpenseWithStatus[];
  incomeItems: FixedExpenseWithStatus[];
  creditCardItems: FixedExpenseWithStatus[];
  debtPaymentItems: FixedExpenseWithStatus[];
  filteredExpenseTotal: number;
  filteredIncomeTotal: number;
  creditCardTotal: number;
  debtPaymentTotal: number;
  pendingAmount: number;
  openCreateForm: () => void;
  openEditForm: (id: string) => void;
  closeForm: () => void;
  handleFormSuccess: () => void;
  requestDelete: (id: string) => void;
  cancelDelete: () => void;
  handleDelete: () => Promise<void>;
  payExpense: (id: string, amount?: number) => Promise<void>;
  toggleActive: (id: string, isActive: boolean) => Promise<void>;
  toggleExpenseCategory: (categoryId: string) => void;
  toggleIncomeCategory: (categoryId: string) => void;
  clearExpenseFilters: () => void;
  clearIncomeFilters: () => void;
}
