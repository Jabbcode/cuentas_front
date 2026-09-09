import { describe, it, expect, afterEach, vi } from 'vitest';
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { api } from '../../api/client';
import { fixedExpensesApi } from './api';

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

describe('fixedExpensesApi', () => {
  it('getAll sin activeOnly: sin params', async () => {
    const { adapter, calls } = captureAdapter([]);
    api.defaults.adapter = adapter;

    await fixedExpensesApi.getAll();

    expect(calls[0].url).toBe('/fixed-expenses');
    expect(calls[0].params).toEqual({});
  });

  it('getAll con activeOnly=true: filtra active=true', async () => {
    const { adapter, calls } = captureAdapter([]);
    api.defaults.adapter = adapter;

    await fixedExpensesApi.getAll(true);

    expect(calls[0].params).toEqual({ active: 'true' });
  });

  it('getById: GET /fixed-expenses/:id', async () => {
    const { adapter, calls } = captureAdapter({});
    api.defaults.adapter = adapter;

    await fixedExpensesApi.getById('fe-1');

    expect(calls[0].url).toBe('/fixed-expenses/fe-1');
    expect(calls[0].method).toBe('get');
  });

  it('create: POST /fixed-expenses con el input', async () => {
    const { adapter, calls } = captureAdapter({});
    api.defaults.adapter = adapter;
    const input = {
      name: 'Renta',
      amount: 500,
      type: 'expense' as const,
      dueDay: 5,
      accountId: 'acc-1',
      categoryId: 'cat-1',
    };

    await fixedExpensesApi.create(input);

    expect(calls[0].url).toBe('/fixed-expenses');
    expect(calls[0].method).toBe('post');
    expect(JSON.parse(calls[0].data as string)).toEqual(input);
  });

  it('update: PATCH /fixed-expenses/:id', async () => {
    const { adapter, calls } = captureAdapter({});
    api.defaults.adapter = adapter;

    await fixedExpensesApi.update('fe-1', { amount: 600 });

    expect(calls[0].url).toBe('/fixed-expenses/fe-1');
    expect(calls[0].method).toBe('patch');
  });

  it('delete: DELETE /fixed-expenses/:id', async () => {
    const { adapter, calls } = captureAdapter(undefined);
    api.defaults.adapter = adapter;

    await fixedExpensesApi.delete('fe-1');

    expect(calls[0].url).toBe('/fixed-expenses/fe-1');
    expect(calls[0].method).toBe('delete');
  });

  it('pay sin data: POST /fixed-expenses/:id/pay con body vacío', async () => {
    const { adapter, calls } = captureAdapter({});
    api.defaults.adapter = adapter;

    await fixedExpensesApi.pay('fe-1');

    expect(calls[0].url).toBe('/fixed-expenses/fe-1/pay');
    expect(calls[0].method).toBe('post');
    expect(JSON.parse(calls[0].data as string)).toEqual({});
  });

  it('pay con data: manda el amount/date', async () => {
    const { adapter, calls } = captureAdapter({});
    api.defaults.adapter = adapter;

    await fixedExpensesApi.pay('fe-1', { amount: 100, date: '2024-05-01' });

    expect(JSON.parse(calls[0].data as string)).toEqual({ amount: 100, date: '2024-05-01' });
  });

  it('getSummary: GET /fixed-expenses/summary', async () => {
    const { adapter, calls } = captureAdapter({});
    api.defaults.adapter = adapter;

    await fixedExpensesApi.getSummary();

    expect(calls[0].url).toBe('/fixed-expenses/summary');
  });

  it('reorder: POST /fixed-expenses/reorder con items', async () => {
    const { adapter, calls } = captureAdapter({ success: true });
    api.defaults.adapter = adapter;
    const items = [{ id: 'fe-1', sortOrder: 0 }];

    await fixedExpensesApi.reorder(items);

    expect(calls[0].url).toBe('/fixed-expenses/reorder');
    expect(JSON.parse(calls[0].data as string)).toEqual({ items });
  });
});
