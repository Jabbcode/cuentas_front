import { api } from '../../api/client';
import type { Transaction, TransactionsResponse, ReceiptItem } from '../../types';
import type { TransactionReceiptItemInput } from './types';

export interface TransactionApiFilters {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  categoryId?: string;
  type?: 'expense' | 'income';
  limit?: number;
  offset?: number;
  tag?: string;
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
  tagNames?: string[];
  receiptItems?: TransactionReceiptItemInput[];
}

export interface UpdateTransactionInput {
  description?: string;
  categoryId?: string;
  date?: string;
  amount?: number;
  tagNames?: string[];
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
};
