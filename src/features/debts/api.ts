import { api } from '../../api/client';
import type {
  Debt,
  DebtsSummary,
  CreateDebtInput,
  UpdateDebtInput,
  PayDebtInput,
  RecurringDebtPayment,
  CreateRecurringDebtPaymentInput,
  UpdateRecurringDebtPaymentInput,
} from '../../types';

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

  async pay(id: string, input: PayDebtInput): Promise<{ message: string; payment: unknown }> {
    const { data } = await api.post(`/debts/${id}/pay`, input);
    return data;
  },

  async getSummary(): Promise<DebtsSummary> {
    const { data } = await api.get('/debts/summary');
    return data;
  },
};

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

  async processPending(): Promise<{ message: string; processed: number }> {
    const { data } = await api.post('/recurring-debt-payments/process');
    return data;
  },
};
