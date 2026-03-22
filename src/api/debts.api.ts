import { api } from './client';
import type { Debt, DebtsSummary, CreateDebtInput, UpdateDebtInput, PayDebtInput } from '../types';

export const debtsApi = {
  async getAll(status?: string): Promise<Debt[]> {
    const params = status ? { status } : {};
    const { data } = await api.get('/debts', { params });
    return data;
  },

  async getById(id: string): Promise<Debt> {
    const { data } = await api.get(`/debts/${id}`);
    return data;
  },

  async create(input: CreateDebtInput): Promise<Debt> {
    const { data } = await api.post('/debts', input);
    return data;
  },

  async update(id: string, input: UpdateDebtInput): Promise<Debt> {
    const { data } = await api.patch(`/debts/${id}`, input);
    return data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/debts/${id}`);
    return data;
  },

  async pay(id: string, input: PayDebtInput): Promise<any> {
    const { data } = await api.post(`/debts/${id}/pay`, input);
    return data;
  },

  async getSummary(): Promise<DebtsSummary> {
    const { data } = await api.get('/debts/summary');
    return data;
  },
};
