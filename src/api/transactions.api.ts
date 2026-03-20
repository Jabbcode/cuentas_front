import { api } from './client';
import type { Transaction, TransactionsResponse } from '../types';

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  categoryId?: string;
  type?: 'expense' | 'income';
  limit?: number;
  offset?: number;
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
  }): Promise<Transaction> => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
    const response = await api.patch(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },
};
