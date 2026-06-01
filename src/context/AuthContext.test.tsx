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
    logout: vi.fn(),
    getMe: vi.fn(),
  },
}));

const mockUser: User = { id: 'u1', email: 'test@test.com', name: 'Test User' };

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── checkAuth (mount) ────────────────────────────────────────────────────────

describe('checkAuth on mount', () => {
  it('sin cookie activa (getMe falla) → isAuthenticated=false', async () => {
    vi.mocked(authApi.getMe).mockRejectedValue(new Error('Unauthorized'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(authApi.getMe).toHaveBeenCalledOnce();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('cookie válida (getMe ok) → isAuthenticated=true y user seteado', async () => {
    vi.mocked(authApi.getMe).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    expect(result.current.user).toEqual(mockUser);
  });
});

// ─── login ────────────────────────────────────────────────────────────────────

describe('login', () => {
  it('login exitoso → isAuthenticated=true, user seteado', async () => {
    vi.mocked(authApi.getMe).mockRejectedValue(new Error('Unauthorized'));
    vi.mocked(authApi.login).mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('login fallido → error propagado, isAuthenticated=false', async () => {
    vi.mocked(authApi.getMe).mockRejectedValue(new Error('Unauthorized'));
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
  it('register exitoso → isAuthenticated=true', async () => {
    vi.mocked(authApi.getMe).mockRejectedValue(new Error('Unauthorized'));
    vi.mocked(authApi.register).mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.register('test@test.com', 'pass123', 'Test User');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });
});

// ─── logout ──────────────────────────────────────────────────────────────────

describe('logout', () => {
  it('logout → llama authApi.logout, isAuthenticated=false, user=null', async () => {
    vi.mocked(authApi.getMe).mockResolvedValue(mockUser);
    vi.mocked(authApi.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    act(() => {
      result.current.logout();
    });

    expect(authApi.logout).toHaveBeenCalledOnce();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});

// ─── auth:unauthorized event ──────────────────────────────────────────────────

describe('auth:unauthorized event', () => {
  it('evento auth:unauthorized → logout automático', async () => {
    vi.mocked(authApi.getMe).mockResolvedValue(mockUser);
    vi.mocked(authApi.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    act(() => {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
