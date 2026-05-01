import { api } from '../../api/client';
import type { Account, Transfer } from '../../types';

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

  transfer: async (data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    note?: string;
  }): Promise<Transfer> => {
    const response = await api.post('/accounts/transfer', data);
    return response.data;
  },

  getTransfers: async (accountId: string): Promise<Transfer[]> => {
    const response = await api.get(`/accounts/${accountId}/transfers`);
    return response.data;
  },
};
