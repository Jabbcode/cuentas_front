import { api } from './client';
import type { Transaction, TransactionsResponse, ReceiptItem } from '../types';

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  categoryId?: string;
  type?: 'expense' | 'income';
  limit?: number;
  offset?: number;
  tag?: string;
}

export const transactionsApi = {
  getAll: async (filters?: TransactionFilters): Promise<TransactionsResponse> => {
    const response = await api.get('/transactions', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  create: async (data: {
    amount: number;
    type: 'expense' | 'income';
    description?: string;
    date?: string;
    accountId: string;
    categoryId: string;
    fixedExpenseId?: string;
    imageHash?: string;
    tagNames?: string[];
    receiptItems?: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  }): Promise<Transaction> => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<Transaction> & { tagNames?: string[] }
  ): Promise<Transaction> => {
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
