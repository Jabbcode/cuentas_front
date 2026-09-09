import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSettings } from './useSettings';
import type { UserProfile, AccountStatistics } from '../api';

const mockLogout = vi.hoisted(() => vi.fn());

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ logout: mockLogout }),
}));

vi.mock('../api', () => ({
  settingsApi: {
    getProfile: vi.fn(),
    getStatistics: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    deleteAccount: vi.fn(),
  },
}));

import { settingsApi } from '../api';

const fakeProfile = { id: 'u1', name: 'Usuario', email: 'u@test.com' } as unknown as UserProfile;
const fakeStats = { accounts: 2 } as unknown as AccountStatistics;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(settingsApi.getProfile).mockResolvedValue(fakeProfile);
    vi.mocked(settingsApi.getStatistics).mockResolvedValue(fakeStats);
  });

  it('carga profile y statistics', async () => {
    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.profile).toEqual(fakeProfile));
    expect(result.current.statistics).toEqual(fakeStats);
  });

  describe('handleUpdateProfile', () => {
    it('éxito: muestra mensaje de éxito', async () => {
      vi.mocked(settingsApi.updateProfile).mockResolvedValue(fakeProfile);
      const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.profile).toEqual(fakeProfile));

      await act(async () => {
        await result.current.handleUpdateProfile({ name: 'Nuevo', email: 'u@test.com' });
      });

      expect(result.current.message).toEqual({
        type: 'success',
        text: 'Profile updated successfully',
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('solo envía los campos que cambiaron respecto al perfil actual', async () => {
      vi.mocked(settingsApi.updateProfile).mockResolvedValue(fakeProfile);
      const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.profile).toEqual(fakeProfile));

      await act(async () => {
        await result.current.handleUpdateProfile({ name: 'Nuevo', email: 'u@test.com' });
      });

      expect(settingsApi.updateProfile).toHaveBeenCalledWith({ name: 'Nuevo' });
    });

    it('error: muestra el mensaje del backend si viene en response.data.error', async () => {
      vi.mocked(settingsApi.updateProfile).mockRejectedValue({
        response: { data: { error: 'Email ya en uso' } },
      });
      const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.profile).toEqual(fakeProfile));

      await act(async () => {
        await result.current.handleUpdateProfile({ name: 'Nuevo', email: 'u@test.com' });
      });

      expect(result.current.message).toEqual({ type: 'error', text: 'Email ya en uso' });
    });
  });

  describe('handleChangePassword', () => {
    it('éxito: muestra mensaje de éxito', async () => {
      vi.mocked(settingsApi.changePassword).mockResolvedValue(undefined as never);
      const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.profile).toEqual(fakeProfile));

      await act(async () => {
        await result.current.handleChangePassword({
          currentPassword: 'old',
          newPassword: 'new',
          confirmPassword: 'new',
        });
      });

      expect(result.current.message?.type).toBe('success');
    });

    it('error: usa el fallback cuando el backend no manda mensaje', async () => {
      vi.mocked(settingsApi.changePassword).mockRejectedValue(new Error('fail'));
      const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.profile).toEqual(fakeProfile));

      await act(async () => {
        await result.current.handleChangePassword({
          currentPassword: 'old',
          newPassword: 'new',
          confirmPassword: 'new',
        });
      });

      expect(result.current.message).toEqual({ type: 'error', text: 'Error changing password' });
    });
  });

  describe('handleDeleteAccount', () => {
    let confirmSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      confirmSpy = vi.spyOn(window, 'confirm');
    });

    afterEach(() => {
      confirmSpy.mockRestore();
      vi.useRealTimers();
    });

    it('confirmación de texto incorrecta: no pide window.confirm ni llama a la API', async () => {
      const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.profile).toEqual(fakeProfile));

      await act(async () => {
        await result.current.handleDeleteAccount({ password: 'x', confirmation: 'nope' });
      });

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(settingsApi.deleteAccount).not.toHaveBeenCalled();
      expect(result.current.message?.type).toBe('error');
    });

    it('usuario cancela el window.confirm: no llama a la API', async () => {
      confirmSpy.mockReturnValue(false);
      const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.profile).toEqual(fakeProfile));

      await act(async () => {
        await result.current.handleDeleteAccount({ password: 'x', confirmation: 'DELETE' });
      });

      expect(settingsApi.deleteAccount).not.toHaveBeenCalled();
    });

    it('éxito: elimina la cuenta y hace logout 2s después', async () => {
      confirmSpy.mockReturnValue(true);
      vi.mocked(settingsApi.deleteAccount).mockResolvedValue(undefined as never);
      const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.profile).toEqual(fakeProfile));

      vi.useFakeTimers();
      await act(async () => {
        await result.current.handleDeleteAccount({ password: 'x', confirmation: 'DELETE' });
      });

      expect(settingsApi.deleteAccount).toHaveBeenCalledWith({
        password: 'x',
        confirmation: 'DELETE',
      });
      expect(mockLogout).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockLogout).toHaveBeenCalled();
    });

    it('error de la API: muestra el mensaje y deja isLoading=false', async () => {
      confirmSpy.mockReturnValue(true);
      vi.mocked(settingsApi.deleteAccount).mockRejectedValue(new Error('fail'));
      const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.profile).toEqual(fakeProfile));

      await act(async () => {
        await result.current.handleDeleteAccount({ password: 'x', confirmation: 'DELETE' });
      });

      expect(result.current.message).toEqual({ type: 'error', text: 'Error deleting account' });
      expect(result.current.isLoading).toBe(false);
      expect(mockLogout).not.toHaveBeenCalled();
    });
  });
});
