import { useState, useEffect, useCallback } from 'react';
import { transactionsApi } from '../api';
import type { TransactionCategorySummaryItem, TransactionSummaryFilters } from '../api';

export interface UseTransactionSummaryReturn {
  summary: TransactionCategorySummaryItem[];
  loading: boolean;
  reload: () => void;
}

export function useTransactionSummary(
  filters: TransactionSummaryFilters,
  enabled: boolean = true
): UseTransactionSummaryReturn {
  const [summary, setSummary] = useState<TransactionCategorySummaryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const data = await transactionsApi.getSummary(filters);
      setSummary(data);
    } catch (err) {
      console.error('Error loading transaction summary:', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, filters.startDate, filters.endDate, filters.accountId, filters.type]);

  useEffect(() => {
    load();
  }, [load]);

  const reload = useCallback(() => load(), [load]);

  return { summary, loading, reload };
}
