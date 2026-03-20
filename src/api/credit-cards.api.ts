import { api } from './client';
import type { CreditCardStatement, CreditCardsSummary, PayCreditCardStatementInput } from '../types';

export const creditCardsApi = {
  getSummary: async (): Promise<CreditCardsSummary> => {
    const response = await api.get('/credit-cards/summary');
    return response.data;
  },

  getStatement: async (accountId: string): Promise<CreditCardStatement> => {
    const response = await api.get(`/credit-cards/${accountId}/statement`);
    return response.data;
  },

  payStatement: async (accountId: string, data: PayCreditCardStatementInput): Promise<any> => {
    const response = await api.post(`/credit-cards/${accountId}/pay`, data);
    return response.data;
  },
};
