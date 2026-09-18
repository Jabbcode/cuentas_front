// Re-export shared types from the global types barrel + define feature-local types
export type {
  CreditCardPeriod,
  CreditCardStatement,
  CreditCardsSummary,
  PayCreditCardStatementInput,
} from '../../types';

// ---------------------------------------------------------------------------
// Feature-local types
// ---------------------------------------------------------------------------

export interface PaymentFormData {
  amount: string;
  paymentAccountId: string;
  paymentDate: string;
}

export type PaymentTarget =
  | { kind: 'closed' }
  | { kind: 'overdue'; periodStart: string; endDate: string; amount: number };

export interface PaymentModalState {
  open: boolean;
  statement: import('../../types').CreditCardStatement | null;
  target: PaymentTarget;
}

export interface TransactionsModalState {
  open: boolean;
  statement: import('../../types').CreditCardStatement | null;
  overduePeriod: import('../../types').CreditCardOverduePeriod | null;
}

export interface ExpenseFormData {
  amount: string;
  categoryId: string;
  date: string;
  description: string;
}

export interface ExpenseModalState {
  open: boolean;
  statement: import('../../types').CreditCardStatement | null;
}

export interface UseCreditCardsReturn {
  statements: import('../../types').CreditCardStatement[];
  accounts: import('../../types').Account[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export interface UseCreditCardsPageReturn {
  statements: import('../../types').CreditCardStatement[];
  accounts: import('../../types').Account[];
  loading: boolean;
  paying: boolean;
  collapsedCards: Set<string>;
  paymentModal: PaymentModalState;
  paymentFormData: PaymentFormData;
  transactionsModal: TransactionsModalState;
  expenseModal: ExpenseModalState;
  expenseFormData: ExpenseFormData;
  savingExpense: boolean;
  expenseCategories: import('../../types').Category[];
  toggleCardCollapse: (accountId: string) => void;
  handleOpenPayment: (statement: import('../../types').CreditCardStatement) => void;
  handleOpenOverduePayment: (
    statement: import('../../types').CreditCardStatement,
    period: import('../../types').CreditCardOverduePeriod
  ) => void;
  handleClosePayment: () => void;
  handleOpenTransactions: (statement: import('../../types').CreditCardStatement) => void;
  handleOpenOverdueTransactions: (
    statement: import('../../types').CreditCardStatement,
    period: import('../../types').CreditCardOverduePeriod
  ) => void;
  handleCloseTransactions: () => void;
  handlePay: (e: React.FormEvent) => Promise<void>;
  updatePaymentFormData: (data: Partial<PaymentFormData>) => void;
  handleOpenExpense: (statement: import('../../types').CreditCardStatement) => void;
  handleOpenExpenseFromTransactions: (statement: import('../../types').CreditCardStatement) => void;
  handleCloseExpense: () => void;
  handleExpenseFormChange: (data: Partial<ExpenseFormData>) => void;
  handleSubmitExpense: (e: React.FormEvent) => Promise<void>;
  reload: () => void;
  loadError: string | null;
  overdueMonths: number;
  setOverdueMonths: (months: number) => void;
}
