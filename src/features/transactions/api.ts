import { api } from '../../api/client';
import type { Transaction, TransactionsResponse, ReceiptItem } from '../../types';
import type { TransactionReceiptItemInput } from './types';

export interface TransactionApiFilters {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  categoryIds?: string[];
  type?: 'expense' | 'income';
  limit?: number;
  offset?: number;
  minAmount?: number;
  maxAmount?: number;
}

export interface CreateTransactionInput {
  amount: number;
  type: 'expense' | 'income';
  description?: string;
  date?: string;
  accountId: string;
  categoryId: string;
  fixedExpenseId?: string;
  imageHash?: string;
  receiptItems?: TransactionReceiptItemInput[];
}

export interface UpdateTransactionInput {
  description?: string;
  categoryId?: string;
  date?: string;
  amount?: number;
}

export interface TransactionSummaryFilters {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  type?: 'expense' | 'income';
}

export interface TransactionCategorySummaryItem {
  category: { id: string; name: string; icon: string | null; color: string | null };
  expenseTotal: number;
  incomeTotal: number;
  count: number;
  netTotal: number;
}

export const transactionsApi = {
  getAll: async (filters?: TransactionApiFilters): Promise<TransactionsResponse> => {
    const response = await api.get('/transactions', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  create: async (data: CreateTransactionInput): Promise<Transaction> => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  update: async (id: string, data: UpdateTransactionInput): Promise<Transaction> => {
    const response = await api.patch(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },

  getReceiptItems: async (transactionId: string): Promise<ReceiptItem[]> => {
    const response = await api.get(`/transactions/${transactionId}/items`);
    return response.data;
  },

  getSummary: async (
    filters?: TransactionSummaryFilters
  ): Promise<TransactionCategorySummaryItem[]> => {
    const response = await api.get('/transactions/summary', { params: filters });
    return response.data;
  },
};
