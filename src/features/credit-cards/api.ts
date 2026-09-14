import { api } from '../../api/client';
import type {
  CreditCardStatement,
  CreditCardsSummary,
  PayCreditCardStatementInput,
} from '../../types';

export const creditCardsApi = {
  getSummary: async (params?: { months?: number }): Promise<CreditCardsSummary> => {
    const response = await api.get('/credit-cards/summary', { params });
    return response.data;
  },

  getStatement: async (
    accountId: string,
    params?: { months?: number }
  ): Promise<CreditCardStatement> => {
    const response = await api.get(`/credit-cards/${accountId}/statement`, { params });
    return response.data;
  },

  payStatement: async (
    accountId: string,
    data: PayCreditCardStatementInput
  ): Promise<{ message: string }> => {
    const response = await api.post(`/credit-cards/${accountId}/pay`, data);
    return response.data;
  },
};
