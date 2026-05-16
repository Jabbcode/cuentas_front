import { api } from './client';
import type {
  BankConnection,
  TrueLayerAccount,
  ConfirmMappingsPayload,
} from '../types/banking.types';

export const bankingApi = {
  initConnect: async (): Promise<{ authUrl: string }> => {
    const response = await api.get<{ authUrl: string }>('/banking/connect');
    return response.data;
  },

  getPendingAccounts: async (pendingId: string): Promise<{ accounts: TrueLayerAccount[] }> => {
    const response = await api.get<{ accounts: TrueLayerAccount[] }>(
      `/banking/pending/${pendingId}`
    );
    return response.data;
  },

  confirmMappings: async (
    payload: ConfirmMappingsPayload
  ): Promise<{ connections: BankConnection[] }> => {
    const response = await api.post<{ connections: BankConnection[] }>(
      '/banking/connections/map',
      payload
    );
    return response.data;
  },

  getConnections: async (): Promise<BankConnection[]> => {
    const response = await api.get<BankConnection[]>('/banking/connections');
    return response.data;
  },

  getStatus: async (): Promise<{
    isConnected: boolean;
    connections: { bankName: string; accountName: string; lastSyncedAt: string | null }[];
  }> => {
    const response = await api.get('/banking/status');
    return response.data;
  },

  disconnect: async (connectionId: string): Promise<void> => {
    await api.delete(`/banking/connections/${connectionId}`);
  },

  triggerSync: async (connectionId: string): Promise<void> => {
    await api.post(`/banking/connections/${connectionId}/sync`);
  },
};
