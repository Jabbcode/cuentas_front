import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { FormEvent } from 'react';
import { useLoginPage } from './useLoginPage';

const mockLogin = vi.hoisted(() => vi.fn());

vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

const fakeEvent = { preventDefault: vi.fn() } as unknown as FormEvent;

describe('useLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls login with email and password, clears error on success', async () => {
    mockLogin.mockResolvedValue(undefined);
    const { result } = renderHook(() => useLoginPage());

    act(() => {
      result.current.setEmail('user@test.com');
      result.current.setPassword('secret123');
    });

    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'secret123');
    expect(result.current.error).toBe('');
    expect(result.current.loading).toBe(false);
  });

  it('sets loading=false after submit completes', async () => {
    mockLogin.mockResolvedValue(undefined);
    const { result } = renderHook(() => useLoginPage());

    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.loading).toBe(false);
  });

  it('shows fallback message on 401 without error body', async () => {
    const err = Object.assign(new Error('Unauthorized'), {
      isAxiosError: true,
      response: { status: 401, data: {} },
    });
    mockLogin.mockRejectedValue(err);

    const { result } = renderHook(() => useLoginPage());

    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe('Email o contraseña incorrectos');
    expect(result.current.loading).toBe(false);
  });

  it('shows connection error message on network failure', async () => {
    const err = Object.assign(new Error('Network Error'), {
      isAxiosError: true,
      response: undefined,
    });
    mockLogin.mockRejectedValue(err);

    const { result } = renderHook(() => useLoginPage());

    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe(
      'Error de conexión. Verifica tu internet e intenta de nuevo.'
    );
  });
});
