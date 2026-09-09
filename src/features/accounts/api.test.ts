import { describe, it, expect, vi, afterEach } from 'vitest';
import { api } from '../../api/client';
import { accountsApi } from './api';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('accountsApi', () => {
  it('getAll llama a GET /accounts', async () => {
    const spy = vi.spyOn(api, 'get').mockResolvedValue({ data: [{ id: 'a1' }] });

    const result = await accountsApi.getAll();

    expect(spy).toHaveBeenCalledWith('/accounts');
    expect(result).toEqual([{ id: 'a1' }]);
  });

  it('getById llama a GET /accounts/:id', async () => {
    const spy = vi.spyOn(api, 'get').mockResolvedValue({ data: { id: 'a1' } });

    await accountsApi.getById('a1');

    expect(spy).toHaveBeenCalledWith('/accounts/a1');
  });

  it('create llama a POST /accounts con el payload', async () => {
    const spy = vi.spyOn(api, 'post').mockResolvedValue({ data: { id: 'a1' } });
    const payload = { name: 'Nueva', type: 'bank' as const, balance: 0, currency: 'EUR' };

    await accountsApi.create(payload);

    expect(spy).toHaveBeenCalledWith('/accounts', payload);
  });

  it('update llama a PATCH /accounts/:id con el payload', async () => {
    const spy = vi.spyOn(api, 'patch').mockResolvedValue({ data: { id: 'a1' } });

    await accountsApi.update('a1', { name: 'Actualizada' });

    expect(spy).toHaveBeenCalledWith('/accounts/a1', { name: 'Actualizada' });
  });

  it('delete llama a DELETE /accounts/:id', async () => {
    const spy = vi.spyOn(api, 'delete').mockResolvedValue({ data: undefined });

    await accountsApi.delete('a1');

    expect(spy).toHaveBeenCalledWith('/accounts/a1');
  });

  it('transfer llama a POST /accounts/transfer con el payload', async () => {
    const spy = vi.spyOn(api, 'post').mockResolvedValue({ data: { id: 't1' } });
    const payload = { fromAccountId: 'a1', toAccountId: 'a2', amount: 50 };

    await accountsApi.transfer(payload);

    expect(spy).toHaveBeenCalledWith('/accounts/transfer', payload);
  });

  it('getTransfers llama a GET /accounts/:id/transfers', async () => {
    const spy = vi.spyOn(api, 'get').mockResolvedValue({ data: [] });

    await accountsApi.getTransfers('a1');

    expect(spy).toHaveBeenCalledWith('/accounts/a1/transfers');
  });
});
