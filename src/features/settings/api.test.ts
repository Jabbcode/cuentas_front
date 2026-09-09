import { describe, it, expect, vi, afterEach } from 'vitest';
import { api } from '../../api/client';
import { settingsApi } from './api';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('settingsApi', () => {
  it('getProfile llama a GET /settings/profile', async () => {
    const spy = vi.spyOn(api, 'get').mockResolvedValue({ data: { id: 'u1' } });

    const result = await settingsApi.getProfile();

    expect(spy).toHaveBeenCalledWith('/settings/profile');
    expect(result).toEqual({ id: 'u1' });
  });

  it('updateProfile llama a PATCH /settings/profile y devuelve data.profile', async () => {
    const spy = vi
      .spyOn(api, 'patch')
      .mockResolvedValue({ data: { profile: { id: 'u1', name: 'Nuevo' } } });

    const result = await settingsApi.updateProfile({ name: 'Nuevo' });

    expect(spy).toHaveBeenCalledWith('/settings/profile', { name: 'Nuevo' });
    expect(result).toEqual({ id: 'u1', name: 'Nuevo' });
  });

  it('changePassword llama a POST /settings/change-password', async () => {
    const spy = vi.spyOn(api, 'post').mockResolvedValue({ data: { message: 'ok' } });
    const payload = { currentPassword: 'a', newPassword: 'b', confirmPassword: 'b' };

    await settingsApi.changePassword(payload);

    expect(spy).toHaveBeenCalledWith('/settings/change-password', payload);
  });

  it('getStatistics llama a GET /settings/statistics', async () => {
    const spy = vi.spyOn(api, 'get').mockResolvedValue({ data: { accounts: 1 } });

    await settingsApi.getStatistics();

    expect(spy).toHaveBeenCalledWith('/settings/statistics');
  });

  it('deleteAccount llama a DELETE /settings/account con el body en data', async () => {
    const spy = vi.spyOn(api, 'delete').mockResolvedValue({ data: { message: 'ok' } });
    const payload = { password: 'x', confirmation: 'DELETE' as const };

    await settingsApi.deleteAccount(payload);

    expect(spy).toHaveBeenCalledWith('/settings/account', { data: payload });
  });
});
