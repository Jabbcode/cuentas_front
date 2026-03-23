import { api } from './client';
import type {
  RecurringDebtPayment,
  CreateRecurringDebtPaymentInput,
  UpdateRecurringDebtPaymentInput,
} from '../types';

export const recurringDebtPaymentsApi = {
  async getAll(debtId?: string): Promise<RecurringDebtPayment[]> {
    const params = debtId ? { debtId } : {};
    const { data } = await api.get('/recurring-debt-payments', { params });
    return data;
  },

  async getById(id: string): Promise<RecurringDebtPayment> {
    const { data } = await api.get(`/recurring-debt-payments/${id}`);
    return data;
  },

  async create(input: CreateRecurringDebtPaymentInput): Promise<RecurringDebtPayment> {
    const { data } = await api.post('/recurring-debt-payments', input);
    return data;
  },

  async update(id: string, input: UpdateRecurringDebtPaymentInput): Promise<RecurringDebtPayment> {
    const { data } = await api.patch(`/recurring-debt-payments/${id}`, input);
    return data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/recurring-debt-payments/${id}`);
    return data;
  },

  async processPending(): Promise<any> {
    const { data } = await api.post('/recurring-debt-payments/process');
    return data;
  },
};
