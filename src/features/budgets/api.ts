import { api } from '../../api/client';
import type { Budget, CreateBudgetInput } from '../../types';

export const budgetsApi = {
  getAll: async (month: number, year: number): Promise<Budget[]> => {
    const response = await api.get('/budgets', { params: { month, year } });
    return response.data;
  },

  create: async (data: CreateBudgetInput): Promise<Budget> => {
    const response = await api.post('/budgets', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateBudgetInput>): Promise<Budget> => {
    const response = await api.patch(`/budgets/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/budgets/${id}`);
  },
};
