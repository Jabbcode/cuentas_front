import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/client', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

import { api } from '../../api/client';
import { creditCardsApi } from './api';

describe('creditCardsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getSummary: GET /credit-cards/summary', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { totalToPay: 0 } });

    const result = await creditCardsApi.getSummary();

    expect(api.get).toHaveBeenCalledWith('/credit-cards/summary', { params: undefined });
    expect(result).toEqual({ totalToPay: 0 });
  });

  it('getSummary({ months: 12 }): envía months como query param', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { totalToPay: 0 } });

    await creditCardsApi.getSummary({ months: 12 });

    expect(api.get).toHaveBeenCalledWith('/credit-cards/summary', { params: { months: 12 } });
  });

  it('getStatement: GET /credit-cards/:accountId/statement', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} });

    await creditCardsApi.getStatement('card-1');

    expect(api.get).toHaveBeenCalledWith('/credit-cards/card-1/statement', { params: undefined });
  });

  it('getStatement con months: envía months como query param', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} });

    await creditCardsApi.getStatement('card-1', { months: 3 });

    expect(api.get).toHaveBeenCalledWith('/credit-cards/card-1/statement', {
      params: { months: 3 },
    });
  });

  it('payStatement: POST /credit-cards/:accountId/pay con el payload', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'ok' } });
    const payload = { amount: 100, paymentAccountId: 'account-1' };

    const result = await creditCardsApi.payStatement('card-1', payload);

    expect(api.post).toHaveBeenCalledWith('/credit-cards/card-1/pay', payload);
    expect(result).toEqual({ message: 'ok' });
  });
});
