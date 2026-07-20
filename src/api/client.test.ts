import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { api } from './client';

const originalAdapter = api.defaults.adapter;

function mockAdapter(status: number, url = '/test'): AxiosAdapter {
  if (status >= 200 && status < 300) {
    return vi.fn().mockResolvedValue({
      data: {},
      status,
      statusText: 'OK',
      headers: {},
      config: { url } as InternalAxiosRequestConfig,
    });
  }
  const error = Object.assign(new Error('Request failed'), {
    response: { status, data: {}, headers: {} },
    config: { url } as InternalAxiosRequestConfig,
    isAxiosError: true,
  });
  return vi.fn().mockRejectedValue(error);
}

beforeAll(() => {
  api.defaults.adapter = originalAdapter;
});

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  api.defaults.adapter = originalAdapter;
});

// ─── Response interceptor ─────────────────────────────────────────────────────

describe('response interceptor', () => {
  it('dispatches auth:unauthorized event on 401 for non-auth endpoints', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    api.defaults.adapter = mockAdapter(401, '/accounts');

    await expect(api.get('/accounts')).rejects.toBeDefined();

    expect(dispatchSpy).toHaveBeenCalledOnce();
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe('auth:unauthorized');
  });

  it('does NOT dispatch auth:unauthorized on 401 for /auth/* endpoints', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    api.defaults.adapter = mockAdapter(401, '/auth/login');

    await expect(api.get('/auth/login')).rejects.toBeDefined();

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('does NOT dispatch auth:unauthorized on 500 errors', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    api.defaults.adapter = mockAdapter(500, '/accounts');

    await expect(api.get('/accounts')).rejects.toBeDefined();

    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
