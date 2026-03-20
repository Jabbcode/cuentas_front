import { api } from './client';
import type { FixedExpense, FixedExpenseSummary, Transaction } from '../types';

export const fixedExpensesApi = {
  getAll: async (activeOnly = false): Promise<FixedExpense[]> => {
    const params = activeOnly ? { active: 'true' } : {};
    const response = await api.get('/fixed-expenses', { params });
    return response.data;
  },

  getById: async (id: string): Promise<FixedExpense & { transactions: Transaction[] }> => {
    const response = await api.get(`/fixed-expenses/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    amount: number;
    type: 'expense' | 'income';
    dueDay: number;
    description?: string;
    accountId: string;
    categoryId: string;
    isActive?: boolean;
  }): Promise<FixedExpense> => {
    const response = await api.post('/fixed-expenses', data);
    return response.data;
  },

  update: async (id: string, data: Partial<FixedExpense>): Promise<FixedExpense> => {
    const response = await api.patch(`/fixed-expenses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/fixed-expenses/${id}`);
  },

  pay: async (id: string, data?: { date?: string; amount?: number }): Promise<Transaction> => {
    const response = await api.post(`/fixed-expenses/${id}/pay`, data || {});
    return response.data;
  },

  getSummary: async (): Promise<FixedExpenseSummary> => {
    const response = await api.get('/fixed-expenses/summary');
    return response.data;
  },

  reorder: async (items: { id: string; sortOrder: number }[]): Promise<{ success: boolean }> => {
    const response = await api.post('/fixed-expenses/reorder', { items });
    return response.data;
  },
};
