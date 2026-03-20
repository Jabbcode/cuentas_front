import { api } from './client';
import type { Category } from '../types';

export const categoriesApi = {
  getAll: async (type?: 'expense' | 'income'): Promise<Category[]> => {
    const params = type ? { type } : {};
    const response = await api.get('/categories', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data: Omit<Category, 'id'>): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
