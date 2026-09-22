import { api } from '../../api/client';
import type { AnalysisFilters, CategoryMonthlySeriesResponse } from './types';

export const analysisApi = {
  getCategoryMonthlySeries: async (
    filters: AnalysisFilters
  ): Promise<CategoryMonthlySeriesResponse> => {
    const { accountId, ...rest } = filters;
    const params = accountId !== 'all' ? { ...rest, accountId } : rest;
    const response = await api.get('/transactions/category-series', { params });
    return response.data;
  },
};
