import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryClientWrapper } from '../../../test-utils/query-client';
import { useCreditCards } from './useCreditCards';
import type { Account, CreditCardsSummary } from '../../../types';

vi.mock('../api', () => ({
  creditCardsApi: { getSummary: vi.fn() },
}));

vi.mock('../../accounts/api', () => ({
  accountsApi: { getAll: vi.fn() },
}));

vi.mock('../../../lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { creditCardsApi } from '../api';
import { accountsApi } from '../../accounts/api';

const fakeSummary = { cards: [{ account: { id: 'card-1' } }] } as unknown as CreditCardsSummary;

describe('useCreditCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga los statements de tarjetas y filtra las cuentas que no son tarjeta', async () => {
    vi.mocked(creditCardsApi.getSummary).mockResolvedValue(fakeSummary);
    vi.mocked(accountsApi.getAll).mockResolvedValue([
      { id: 'a1', type: 'bank' },
      { id: 'a2', type: 'credit_card' },
    ] as unknown as Account[]);

    const { result } = renderHook(() => useCreditCards(), { wrapper: createQueryClientWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.statements).toEqual(fakeSummary.cards);
    expect(result.current.accounts).toEqual([{ id: 'a1', type: 'bank' }]);
    expect(result.current.error).toBeNull();
  });

  it('error en statements: expone el mensaje traducido', async () => {
    vi.mocked(creditCardsApi.getSummary).mockRejectedValue(new Error('boom'));
    vi.mocked(accountsApi.getAll).mockResolvedValue([]);

    const { result } = renderHook(() => useCreditCards(), { wrapper: createQueryClientWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Error al cargar las tarjetas. Intenta de nuevo.');
  });

  it('error en accounts: expone su mensaje traducido cuando statements sí carga', async () => {
    vi.mocked(creditCardsApi.getSummary).mockResolvedValue(fakeSummary);
    vi.mocked(accountsApi.getAll).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useCreditCards(), { wrapper: createQueryClientWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Error al cargar las cuentas. Intenta de nuevo.');
  });
});
