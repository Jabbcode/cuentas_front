import { api } from './client';
import type { Tag, TagSummary } from '../types';

export const tagsApi = {
  getAll: async (name?: string): Promise<Tag[]> => {
    const response = await api.get('/tags', { params: name ? { name } : undefined });
    return response.data;
  },

  getSummary: async (): Promise<TagSummary[]> => {
    const response = await api.get('/tags/summary');
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tags/${id}`);
  },
};
