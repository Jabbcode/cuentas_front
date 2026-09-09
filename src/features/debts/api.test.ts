import { describe, it, expect, afterEach, vi } from 'vitest';
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { api } from '../../api/client';
import { debtsApi, recurringDebtPaymentsApi } from './api';

const originalAdapter = api.defaults.adapter;

function captureAdapter(responseData: unknown = {}) {
  const calls: InternalAxiosRequestConfig[] = [];
  const adapter: AxiosAdapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
    calls.push(config);
    return { data: responseData, status: 200, statusText: 'OK', headers: {}, config };
  });
  return { adapter, calls };
}

afterEach(() => {
  api.defaults.adapter = originalAdapter;
});

describe('debtsApi', () => {
  it('getAll sin status: GET /debts sin params', async () => {
    const { adapter, calls } = captureAdapter([]);
    api.defaults.adapter = adapter;

    await debtsApi.getAll();

    expect(calls[0].url).toBe('/debts');
    expect(calls[0].method).toBe('get');
    expect(calls[0].params).toEqual({});
  });

  it('getAll con status: agrega el filtro', async () => {
    const { adapter, calls } = captureAdapter([]);
    api.defaults.adapter = adapter;

    await debtsApi.getAll('overdue');

    expect(calls[0].params).toEqual({ status: 'overdue' });
  });

  it('getById: GET /debts/:id', async () => {
    const { adapter, calls } = captureAdapter({});
    api.defaults.adapter = adapter;

    await debtsApi.getById('debt-1');

    expect(calls[0].url).toBe('/debts/debt-1');
    expect(calls[0].method).toBe('get');
  });

  it('create: POST /debts con el input', async () => {
    const { adapter, calls } = captureAdapter({});
    api.defaults.adapter = adapter;
    const input = { creditor: 'Banco', description: 'x', totalAmount: 100 };

    await debtsApi.create(input);

    expect(calls[0].url).toBe('/debts');
    expect(calls[0].method).toBe('post');
    expect(JSON.parse(calls[0].data as string)).toEqual(input);
  });

  it('update: PATCH /debts/:id', async () => {
    const { adapter, calls } = captureAdapter({});
    api.defaults.adapter = adapter;

    await debtsApi.update('debt-1', { creditor: 'Nuevo' });

    expect(calls[0].url).toBe('/debts/debt-1');
    expect(calls[0].method).toBe('patch');
  });

  it('delete: DELETE /debts/:id', async () => {
    const { adapter, calls } = captureAdapter({ message: 'ok' });
    api.defaults.adapter = adapter;

    await debtsApi.delete('debt-1');

    expect(calls[0].url).toBe('/debts/debt-1');
    expect(calls[0].method).toBe('delete');
  });

  it('pay: POST /debts/:id/pay con el input', async () => {
    const { adapter, calls } = captureAdapter({});
    api.defaults.adapter = adapter;
    const input = { amount: 50, accountId: 'acc-1' };

    await debtsApi.pay('debt-1', input);

    expect(calls[0].url).toBe('/debts/debt-1/pay');
    expect(calls[0].method).toBe('post');
    expect(JSON.parse(calls[0].data as string)).toEqual(input);
  });

  it('getSummary: GET /debts/summary', async () => {
    const { adapter, calls } = captureAdapter({});
    api.defaults.adapter = adapter;

    await debtsApi.getSummary();

    expect(calls[0].url).toBe('/debts/summary');
    expect(calls[0].method).toBe('get');
  });
});

describe('recurringDebtPaymentsApi', () => {
  it('getAll sin debtId: sin params', async () => {
    const { adapter, calls } = captureAdapter([]);
    api.defaults.adapter = adapter;

    await recurringDebtPaymentsApi.getAll();

    expect(calls[0].url).toBe('/recurring-debt-payments');
    expect(calls[0].params).toEqual({});
  });

  it('getAll con debtId: filtra', async () => {
    const { adapter, calls } = captureAdapter([]);
    api.defaults.adapter = adapter;

    await recurringDebtPaymentsApi.getAll('debt-1');

    expect(calls[0].params).toEqual({ debtId: 'debt-1' });
  });

  it('create: POST /recurring-debt-payments', async () => {
    const { adapter, calls } = captureAdapter({});
    api.defaults.adapter = adapter;

    await recurringDebtPaymentsApi.create({
      debtId: 'debt-1',
      amount: 100,
      accountId: 'acc-1',
      frequency: 'monthly',
    });

    expect(calls[0].url).toBe('/recurring-debt-payments');
    expect(calls[0].method).toBe('post');
  });

  it('update: PATCH /recurring-debt-payments/:id', async () => {
    const { adapter, calls } = captureAdapter({});
    api.defaults.adapter = adapter;

    await recurringDebtPaymentsApi.update('rp-1', { amount: 200 });

    expect(calls[0].url).toBe('/recurring-debt-payments/rp-1');
    expect(calls[0].method).toBe('patch');
  });

  it('delete: DELETE /recurring-debt-payments/:id', async () => {
    const { adapter, calls } = captureAdapter({ message: 'ok' });
    api.defaults.adapter = adapter;

    await recurringDebtPaymentsApi.delete('rp-1');

    expect(calls[0].url).toBe('/recurring-debt-payments/rp-1');
    expect(calls[0].method).toBe('delete');
  });

  it('processPending: POST /recurring-debt-payments/process', async () => {
    const { adapter, calls } = captureAdapter({ message: 'ok', processed: 3 });
    api.defaults.adapter = adapter;

    await recurringDebtPaymentsApi.processPending();

    expect(calls[0].url).toBe('/recurring-debt-payments/process');
    expect(calls[0].method).toBe('post');
  });
});
