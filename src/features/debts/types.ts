import type { Debt, RecurringDebtPayment } from '../../types';

// UI-only form data — domain types stay in src/types/index.ts

export interface DebtFormData {
  creditor: string;
  description: string;
  totalAmount: string;
  interestRate: string;
  interestType: 'fixed' | 'percentage' | '';
  dueDate: string;
}

export interface RecurringPaymentFormData {
  amount: string;
  accountId: string;
  frequency: 'monthly' | 'biweekly' | 'weekly';
  dayOfMonth: string;
  dayOfWeek: string;
  endDate: string;
  notes: string;
}

export interface DebtGroups {
  activeDebts: Debt[];
  overdueDebts: Debt[];
  paidDebts: Debt[];
}

export interface DebtTotals {
  totalActiveDebt: number;
  totalOverdueDebt: number;
}

export interface UseDebtsPageReturn {
  // Data
  debts: Debt[];
  recurringPayments: RecurringDebtPayment[];
  loading: boolean;

  // Modal state
  showForm: boolean;
  editingDebt: Debt | undefined;
  payingDebt: Debt | undefined;
  viewingHistory: Debt | undefined;
  configuringRecurring: Debt | undefined;
  editingRecurring: RecurringDebtPayment | undefined;
  deleteId: string | null;
  deleteRecurringId: string | null;
  deleting: boolean;

  // Computed groups & totals
  groups: DebtGroups;
  totals: DebtTotals;

  // Handlers
  getDebtRecurringPayments: (debtId: string) => RecurringDebtPayment[];
  handleOpenCreate: () => void;
  handleEditDebt: (debt: Debt) => void;
  handleCloseForm: () => void;
  handleFormSuccess: () => void;
  handlePay: (amount: number, accountId: string, notes?: string) => Promise<void>;
  handleClosePay: () => void;
  handleCloseHistory: () => void;
  handleOpenRecurring: (debt: Debt) => void;
  handleEditRecurring: (rp: RecurringDebtPayment, debt: Debt) => void;
  handleCloseRecurring: () => void;
  handleRecurringSuccess: () => void;
  handleRequestDelete: (id: string) => void;
  handleConfirmDelete: () => Promise<void>;
  handleCancelDelete: () => void;
  handleRequestDeleteRecurring: (id: string) => void;
  handleConfirmDeleteRecurring: () => Promise<void>;
  handleCancelDeleteRecurring: () => void;
  handleViewHistory: (debt: Debt) => void;
  handleSetPayingDebt: (debt: Debt) => void;
  toggleActive: (id: string, isActive: boolean) => Promise<void>;
}
