import { api } from './client';
import type { Account } from '../types';

export const accountsApi = {
  getAll: async (): Promise<Account[]> => {
    const response = await api.get('/accounts');
    return response.data;
  },

  getById: async (id: string): Promise<Account> => {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },

  create: async (data: Omit<Account, 'id' | 'createdAt'>): Promise<Account> => {
    const response = await api.post('/accounts', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Account>): Promise<Account> => {
    const response = await api.patch(`/accounts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/accounts/${id}`);
  },
};
