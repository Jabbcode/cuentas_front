import { useState, useCallback } from 'react';
import { bankingApi } from '../api/banking.api';
import type { TrueLayerAccount } from '../types/banking.types';

export interface UseBankMappingReturn {
  truelayerAccounts: TrueLayerAccount[];
  mappings: Record<string, string>;
  setMapping: (truelayerId: string, appAccountId: string) => void;
  submit: (pendingAuthId: string) => Promise<void>;
  loading: boolean;
  loadAccounts: (pendingId: string) => Promise<void>;
}

export function useBankMapping(): UseBankMappingReturn {
  const [truelayerAccounts, setTruelayerAccounts] = useState<TrueLayerAccount[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const loadAccounts = useCallback(async (pendingId: string): Promise<void> => {
    setLoading(true);
    try {
      const { accounts } = await bankingApi.getPendingAccounts(pendingId);
      setTruelayerAccounts(accounts);
    } finally {
      setLoading(false);
    }
  }, []);

  const setMapping = useCallback((truelayerId: string, appAccountId: string): void => {
    setMappings((prev) => ({ ...prev, [truelayerId]: appAccountId }));
  }, []);

  const submit = useCallback(
    async (pendingAuthId: string): Promise<void> => {
      setLoading(true);
      try {
        const selectedMappings = Object.entries(mappings)
          .filter(([, appAccountId]) => appAccountId !== '')
          .map(([truelayerAccountId, appAccountId]) => ({
            truelayerAccountId,
            appAccountId,
          }));

        await bankingApi.confirmMappings({
          pendingAuthId,
          mappings: selectedMappings,
        });
      } finally {
        setLoading(false);
      }
    },
    [mappings]
  );

  return {
    truelayerAccounts,
    mappings,
    setMapping,
    submit,
    loading,
    loadAccounts,
  };
}
