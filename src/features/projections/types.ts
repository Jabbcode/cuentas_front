export interface ProjectedFixedExpense {
  id: string;
  name: string;
  amount: number;
  type: 'expense' | 'income';
  dueDate: string;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
}

export interface ProjectedDebtPayment {
  id: string;
  debtName: string;
  amount: number;
  dueDate: string;
  frequency: string;
}

export interface TimelinePoint {
  date: string;
  projectedBalance: number;
}

export interface FinancialProjection {
  period: { days: number; from: string; to: string };
  currentBalance: number;
  projectedBalance: number;
  outflows: {
    fixedExpenses: ProjectedFixedExpense[];
    fixedIncome: ProjectedFixedExpense[];
    debtPayments: ProjectedDebtPayment[];
    totalExpenses: number;
    totalIncome: number;
    totalDebt: number;
  };
  historical: { monthlyAverage: number; forPeriod: number };
  timeline: TimelinePoint[];
}

export interface UseProjectionsReturn {
  data: FinancialProjection | undefined;
  isLoading: boolean;
  error: Error | null;
}

export interface UseProjectionsPageReturn {
  data: FinancialProjection | undefined;
  isLoading: boolean;
  error: Error | null;
  days: number;
  customDays: string;
  isCustom: boolean;
  setPresetDays: (days: number) => void;
  handleCustomDays: (value: string) => void;
  applyCustomDays: () => void;
}
