import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { authApi } from '../features/auth/api';
import type { User } from '../types';

vi.mock('../features/auth/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
  },
}));

const mockUser: User = { id: 'u1', email: 'test@test.com', name: 'Test User' };

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

// ─── checkAuth (mount) ────────────────────────────────────────────────────────

describe('checkAuth on mount', () => {
  it('no token → isAuthenticated=false sin llamar getMe', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(authApi.getMe).not.toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('token válido → isAuthenticated=true y user seteado', async () => {
    localStorage.setItem('token', 'valid-token');
    vi.mocked(authApi.getMe).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    expect(result.current.user).toEqual(mockUser);
  });

  it('token inválido (401) → token eliminado, isAuthenticated=false', async () => {
    localStorage.setItem('token', 'expired-token');
    vi.mocked(authApi.getMe).mockRejectedValue(new Error('Unauthorized'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(localStorage.getItem('token')).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});

// ─── login ────────────────────────────────────────────────────────────────────

describe('login', () => {
  it('login exitoso → token en localStorage, isAuthenticated=true, user seteado', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ token: 'new-token', user: mockUser });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    expect(localStorage.getItem('token')).toBe('new-token');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('login fallido → error propagado, isAuthenticated=false', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Credenciales inválidas'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      act(async () => {
        await result.current.login('test@test.com', 'wrong');
      })
    ).rejects.toThrow('Credenciales inválidas');

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});

// ─── register ────────────────────────────────────────────────────────────────

describe('register', () => {
  it('register exitoso → token en localStorage, isAuthenticated=true', async () => {
    vi.mocked(authApi.register).mockResolvedValue({ token: 'reg-token', user: mockUser });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.register('test@test.com', 'pass123', 'Test User');
    });

    expect(localStorage.getItem('token')).toBe('reg-token');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });
});

// ─── logout ──────────────────────────────────────────────────────────────────

describe('logout', () => {
  it('logout → token eliminado, isAuthenticated=false, user=null', async () => {
    localStorage.setItem('token', 'valid-token');
    vi.mocked(authApi.getMe).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    act(() => {
      result.current.logout();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});

// ─── auth:unauthorized event (FIX-023) ───────────────────────────────────────

describe('auth:unauthorized event', () => {
  it('evento auth:unauthorized → logout automático', async () => {
    localStorage.setItem('token', 'valid-token');
    vi.mocked(authApi.getMe).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    act(() => {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
