import { describe, it, expect, vi, afterEach } from 'vitest';
import { api } from '../../api/client';
import { authApi } from './api';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('authApi', () => {
  it('register llama a POST /auth/register con el payload', async () => {
    const spy = vi.spyOn(api, 'post').mockResolvedValue({ data: { user: {}, token: 'x' } });
    const payload = { email: 'a@a.com', password: '123456', name: 'A' };

    await authApi.register(payload);

    expect(spy).toHaveBeenCalledWith('/auth/register', payload);
  });

  it('login llama a POST /auth/login con el payload', async () => {
    const spy = vi.spyOn(api, 'post').mockResolvedValue({ data: { user: {}, token: 'x' } });
    const payload = { email: 'a@a.com', password: '123456' };

    await authApi.login(payload);

    expect(spy).toHaveBeenCalledWith('/auth/login', payload);
  });

  it('logout llama a POST /auth/logout sin body', async () => {
    const spy = vi.spyOn(api, 'post').mockResolvedValue({ data: undefined });

    await authApi.logout();

    expect(spy).toHaveBeenCalledWith('/auth/logout');
  });

  it('getMe llama a GET /auth/me', async () => {
    const spy = vi.spyOn(api, 'get').mockResolvedValue({ data: { id: 'u1' } });

    const result = await authApi.getMe();

    expect(spy).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual({ id: 'u1' });
  });
});
