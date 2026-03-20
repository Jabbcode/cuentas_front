export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit_card';
  balance: number;
  currency: string;
  color?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon?: string;
  color?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'expense' | 'income';
  description?: string;
  date: string;
  accountId: string;
  categoryId: string;
  fixedExpenseId?: string;
  account?: Pick<Account, 'id' | 'name' | 'color'>;
  category?: Pick<Category, 'id' | 'name' | 'icon' | 'color'>;
  createdAt: string;
  updatedAt: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  type: 'expense' | 'income';
  dueDay: number;
  isActive: boolean;
  description?: string;
  accountId: string;
  categoryId: string;
  account?: Pick<Account, 'id' | 'name' | 'color'>;
  category?: Pick<Category, 'id' | 'name' | 'icon' | 'color'>;
  isPaidThisMonth?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FixedExpenseSummary {
  totalMonthlyExpenses: number;
  totalMonthlyIncome: number;
  totalCount: number;
  paidCount: number;
  pendingCount: number;
  items: (FixedExpense & { isPaidThisMonth: boolean })[];
}

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNet: number;
  month: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  total: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface FixedVsVariable {
  fixed: number;
  variable: number;
  total: number;
  fixedPercentage: number;
  variablePercentage: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}
