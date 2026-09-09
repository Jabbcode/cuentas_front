import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransfer } from './useTransfer';

vi.mock('../features/accounts/api', () => ({
  accountsApi: { transfer: vi.fn() },
}));

import { accountsApi } from '../features/accounts/api';

const transferData = { fromAccountId: 'a1', toAccountId: 'a2', amount: 50 };

describe('useTransfer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('éxito: llama a onSuccess y no deja error', async () => {
    vi.mocked(accountsApi.transfer).mockResolvedValue(undefined as never);
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useTransfer(onSuccess));

    await act(async () => {
      await result.current.transfer(transferData);
    });

    expect(accountsApi.transfer).toHaveBeenCalledWith(transferData);
    expect(onSuccess).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('error de la API con mensaje: lo expone y no llama a onSuccess', async () => {
    const err = Object.assign(new Error('fail'), {
      isAxiosError: true,
      response: { data: { error: 'Saldo insuficiente' } },
    });
    vi.mocked(accountsApi.transfer).mockRejectedValue(err);
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useTransfer(onSuccess));

    await act(async () => {
      await result.current.transfer(transferData);
    });

    expect(result.current.error).toBe('Saldo insuficiente');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('error sin mensaje del backend: usa el mensaje genérico', async () => {
    const err = Object.assign(new Error('fail'), { isAxiosError: true, response: undefined });
    vi.mocked(accountsApi.transfer).mockRejectedValue(err);
    const { result } = renderHook(() => useTransfer());

    await act(async () => {
      await result.current.transfer(transferData);
    });

    expect(result.current.error).toBe('Error al realizar la transferencia');
  });

  it('clearError: limpia el error', async () => {
    const err = Object.assign(new Error('fail'), { isAxiosError: true, response: undefined });
    vi.mocked(accountsApi.transfer).mockRejectedValue(err);
    const { result } = renderHook(() => useTransfer());

    await act(async () => {
      await result.current.transfer(transferData);
    });
    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
