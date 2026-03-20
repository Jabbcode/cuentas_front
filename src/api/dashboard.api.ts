import { api } from './client';
import type { DashboardSummary, CategorySummary, MonthlyTrend, FixedVsVariable, ProjectionData } from '../types';

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  getByCategory: async (type: 'expense' | 'income' = 'expense'): Promise<CategorySummary[]> => {
    const response = await api.get('/dashboard/by-category', { params: { type } });
    return response.data;
  },

  getMonthlyTrend: async (months = 6): Promise<MonthlyTrend[]> => {
    const response = await api.get('/dashboard/monthly-trend', { params: { months } });
    return response.data;
  },

  getFixedVsVariable: async (): Promise<FixedVsVariable> => {
    const response = await api.get('/dashboard/fixed-vs-variable');
    return response.data;
  },

  getNextMonthProjection: async (): Promise<ProjectionData> => {
    const response = await api.get('/dashboard/next-month-projection');
    return response.data;
  },
};
