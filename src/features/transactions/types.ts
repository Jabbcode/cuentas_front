// UI/form types for the transactions feature module.
// Domain types (Transaction, Account, Category, etc.) live in src/types/index.ts.

export interface TransactionFormData {
  amount: string;
  type: 'expense' | 'income';
  description: string;
  date: string;
  accountId: string;
  categoryId: string;
  imageHash: string | undefined;
  receiptItems: TransactionReceiptItemInput[];
}

export interface TransactionReceiptItemInput {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface TransactionFilterState {
  startDate: string;
  endDate: string;
  categoryIds: string[];
  accountId: string;
  minAmount: string;
  maxAmount: string;
  type: 'all' | 'expense' | 'income';
  groupByCategory: boolean;
}

export interface TransactionPaginationState {
  currentPage: number;
  itemsPerPage: number;
}

export interface TransactionEditInput {
  description?: string;
  categoryId: string;
  date: string;
  amount: string;
}

export type DateWarning = {
  type: 'error' | 'warning';
  message: string;
} | null;
