import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAccounts } from './useAccounts';
import type { Account } from '../../../types';

vi.mock('../api', () => ({
  accountsApi: { getAll: vi.fn() },
}));

vi.mock('../../../lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { accountsApi } from '../api';

const makeAccount = (overrides: Partial<Account> = {}): Account => ({
  id: 'acc-1',
  name: 'BBVA',
  type: 'bank',
  balance: 1000,
  currency: 'EUR',
  createdAt: '2024-01-01',
  ...overrides,
});

describe('useAccounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads accounts and sets loading=false on success', async () => {
    const accounts = [makeAccount()];
    vi.mocked(accountsApi.getAll).mockResolvedValue(accounts);

    const { result } = renderHook(() => useAccounts());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.accounts).toEqual(accounts);
    expect(result.current.error).toBeNull();
  });

  it('sets error state and keeps accounts empty when API fails', async () => {
    vi.mocked(accountsApi.getAll).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAccounts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Error al cargar las cuentas. Intenta de nuevo.');
    expect(result.current.accounts).toEqual([]);
  });

  it('starts with loading=true and transitions to false after fetch completes', async () => {
    let resolve!: (value: Account[]) => void;
    const deferred = new Promise<Account[]>((res) => {
      resolve = res;
    });
    vi.mocked(accountsApi.getAll).mockReturnValue(deferred);

    const { result } = renderHook(() => useAccounts());

    expect(result.current.loading).toBe(true);

    resolve([]);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});
