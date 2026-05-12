import { api } from '../../api/client';
import type { FinancialProjection } from './types';

export const projectionsApi = {
  get: async (days: number): Promise<FinancialProjection> => {
    const response = await api.get('/projections', { params: { days } });
    return response.data;
  },
};
