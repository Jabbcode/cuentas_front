import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { FormEvent } from 'react';
import { useRegisterPage } from './useRegisterPage';

const mockRegister = vi.hoisted(() => vi.fn());

vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

const fakeEvent = { preventDefault: vi.fn() } as unknown as FormEvent;

describe('useRegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a register con email, password y name; limpia el error', async () => {
    mockRegister.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRegisterPage());

    act(() => {
      result.current.setName('Usuario Test');
      result.current.setEmail('user@test.com');
      result.current.setPassword('secret123');
    });

    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(mockRegister).toHaveBeenCalledWith('user@test.com', 'secret123', 'Usuario Test');
    expect(result.current.error).toBe('');
    expect(result.current.loading).toBe(false);
  });

  it('error del backend (email en uso): usa el mensaje del backend', async () => {
    const err = Object.assign(new Error('fail'), {
      isAxiosError: true,
      response: { data: { error: 'El email ya está registrado' } },
    });
    mockRegister.mockRejectedValue(err);

    const { result } = renderHook(() => useRegisterPage());

    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe('El email ya está registrado');
    expect(result.current.loading).toBe(false);
  });

  it('error sin mensaje del backend: usa el mensaje de fallback', async () => {
    const err = Object.assign(new Error('fail'), { isAxiosError: true, response: undefined });
    mockRegister.mockRejectedValue(err);

    const { result } = renderHook(() => useRegisterPage());

    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe(
      'Error de conexión. Verifica tu internet e intenta de nuevo.'
    );
  });
});
