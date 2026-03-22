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
  // Credit card specific fields
  creditLimit?: number;
  cutoffDay?: number;
  paymentDueDay?: number;
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

export interface CategoryProjection {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  total: number;
  items: {
    id: string;
    name: string;
    amount: number;
    dueDay: number;
  }[];
}

export interface ProjectionData {
  month: string;
  year: number;
  monthNumber: number;
  totalExpenses: number;
  totalIncome: number;
  netBalance: number;
  expensesByCategory: CategoryProjection[];
  incomesByCategory: CategoryProjection[];
  comparison: {
    previousMonth: string;
    expensesDiff: number;
    incomeDiff: number;
    netDiff: number;
    expensesPercentage: number;
    incomePercentage: number;
  };
}

// Credit Cards
export interface CreditCardPeriod {
  startDate: string;
  endDate: string;
  balance: number;
  transactions: Transaction[];
}

export interface CreditCardStatement {
  account: Account;
  currentPeriod: CreditCardPeriod & {
    daysUntilCutoff: number;
  };
  closedPeriod: CreditCardPeriod & {
    isPaid: boolean;
    paymentDueDate: string;
    daysUntilDue: number;
  };
  creditLimit: number;
  available: number;
  usagePercentage: number;
  alerts: {
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
  }[];
}

export interface CreditCardsSummary {
  totalToPay: number;
  upcomingPayments: {
    accountId: string;
    accountName: string;
    amount: number;
    dueDate: string;
    daysUntilDue: number;
  }[];
  alerts: {
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    accountId: string;
    accountName: string;
  }[];
  cards: CreditCardStatement[];
}

export interface PayCreditCardStatementInput {
  amount: number;
  paymentAccountId: string;
  paymentDate?: string;
}

// Debts
export interface Debt {
  id: string;
  userId: string;
  creditor: string;
  description: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate?: number;
  interestType?: 'fixed' | 'percentage';
  startDate: string;
  dueDate?: string;
  status: 'active' | 'paid' | 'overdue';
  payments?: DebtPayment[];
  _count?: {
    payments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  userId: string;
  amount: number;
  principal: number;
  interest: number;
  accountId: string;
  account?: Pick<Account, 'id' | 'name'>;
  transactionId?: string;
  paymentDate: string;
  notes?: string;
  createdAt: string;
}

export interface DebtsSummary {
  totalActiveDebts: number;
  totalOverdueDebts: number;
  totalDebtAmount: number;
  totalOverdueAmount: number;
  debtsDueSoon: number;
  upcomingDebts: {
    id: string;
    creditor: string;
    description: string;
    remainingAmount: number;
    dueDate?: string;
  }[];
}

export interface CreateDebtInput {
  creditor: string;
  description: string;
  totalAmount: number;
  interestRate?: number;
  interestType?: 'fixed' | 'percentage';
  startDate?: string;
  dueDate?: string;
}

export interface UpdateDebtInput {
  creditor?: string;
  description?: string;
  interestRate?: number;
  interestType?: 'fixed' | 'percentage';
  dueDate?: string;
  status?: 'active' | 'paid' | 'overdue';
}

export interface PayDebtInput {
  amount: number;
  accountId: string;
  notes?: string;
}
