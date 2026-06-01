// Re-export shared types from the global types barrel
export type { Budget, CreateBudgetInput, Category } from '../../types';

// ---------------------------------------------------------------------------
// Feature-local types
// ---------------------------------------------------------------------------

export interface BudgetFormData {
  categoryId: string;
  amount: string;
  alertAt: string;
}

export interface UseBudgetsReturn {
  budgets: import('../../types').Budget[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export interface UseBudgetsPageReturn {
  budgets: import('../../types').Budget[];
  categories: import('../../types').Category[];
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  month: number;
  year: number;
  showForm: boolean;
  editingBudget: import('../../types').Budget | null;
  deleteId: string | null;
  formData: BudgetFormData;
  error: string;
  availableCategories: import('../../types').Category[];
  openForm: (budget?: import('../../types').Budget) => void;
  closeForm: () => void;
  setDeleteId: (id: string | null) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDelete: () => Promise<void>;
  prevMonth: () => void;
  nextMonth: () => void;
  updateFormData: (data: Partial<BudgetFormData>) => void;
  reload: () => void;
  loadError: string | null;
}
