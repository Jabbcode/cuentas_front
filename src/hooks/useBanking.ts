import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { bankingApi } from '../api/banking.api';
import type { BankConnection } from '../types/banking.types';

export interface UseBankingReturn {
  connections: BankConnection[];
  loading: boolean;
  getConnectionForAccount: (accountId: string) => BankConnection | undefined;
  disconnect: (connectionId: string) => Promise<void>;
  triggerSync: (connectionId: string) => Promise<void>;
  reload: () => void;
}

export function useBanking(): UseBankingReturn {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConnections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bankingApi.getConnections();
      setConnections(data);
    } catch {
      // Silently fail — banking connections are optional
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const reload = useCallback(() => {
    loadConnections();
  }, [loadConnections]);

  const getConnectionForAccount = useCallback(
    (accountId: string): BankConnection | undefined => {
      return connections.find((c) => c.accountId === accountId && c.isActive);
    },
    [connections]
  );

  const disconnect = useCallback(
    async (connectionId: string): Promise<void> => {
      try {
        await bankingApi.disconnect(connectionId);
        toast.success('Cuenta bancaria desvinculada');
        await loadConnections();
      } catch {
        toast.error('Error al desvincular la cuenta bancaria');
      }
    },
    [loadConnections]
  );

  const triggerSync = useCallback(
    async (connectionId: string): Promise<void> => {
      try {
        await bankingApi.triggerSync(connectionId);
        toast.success('Sincronización iniciada');
        await loadConnections();
      } catch {
        toast.error('Error al sincronizar');
      }
    },
    [loadConnections]
  );

  return {
    connections,
    loading,
    getConnectionForAccount,
    disconnect,
    triggerSync,
    reload,
  };
}
