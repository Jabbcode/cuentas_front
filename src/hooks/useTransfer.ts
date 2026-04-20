import { useState } from 'react';
import axios from 'axios';
import { accountsApi } from '../api/accounts.api';

interface TransferData {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  note?: string;
}

export function useTransfer(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transfer = async (data: TransferData) => {
    setLoading(true);
    setError(null);
    try {
      await accountsApi.transfer(data);
      onSuccess?.();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? 'Error al realizar la transferencia')
        : 'Error al realizar la transferencia';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { transfer, loading, error, clearError: () => setError(null) };
}
