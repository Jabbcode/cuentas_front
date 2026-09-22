import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useAccounts } from '../../accounts/hooks/useAccounts';
import { useCategoryMonthlySeries } from './useCategoryMonthlySeries';
import {
  getDefaultAnalysisRange,
  isValidRange,
  pickDefaultSelection,
  pruneSelection,
  MAX_SELECTED_CATEGORIES,
} from '../utils';
import type { AnalysisEmptyState, AnalysisFilters, CategorySeries } from '../types';

const RANGE_ERROR_MESSAGE = '"Desde" debe ser anterior o igual a "Hasta".';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface UseAnalysisPageReturn {
  draftRange: DateRange;
  appliedRange: DateRange;
  rangeError: string | null;
  type: 'expense' | 'income';
  accountId: string;
  accounts: ReturnType<typeof useAccounts>['accounts'];
  selectedCategoryIds: string[];
  isSelectionFull: boolean;
  months: string[];
  series: CategorySeries[];
  loading: boolean;
  emptyState: AnalysisEmptyState;
  setDraftStartDate: (startDate: string) => void;
  setDraftEndDate: (endDate: string) => void;
  setType: (type: 'expense' | 'income') => void;
  setAccountId: (accountId: string) => void;
  toggleCategory: (categoryId: string) => void;
  reload: () => void;
}

/**
 * Estado completo de la página Análisis (ADR-005: la página es UI pura, toda
 * la lógica vive aquí). Nada persiste entre montajes — criterio 8, sin
 * localStorage/sessionStorage/query params — cada `useState` arranca en su
 * valor por defecto cada vez que el componente se monta.
 */
export function useAnalysisPage(): UseAnalysisPageReturn {
  const { accounts } = useAccounts();

  const defaultRange = useMemo(() => getDefaultAnalysisRange(), []);
  const [draftRange, setDraftRange] = useState<DateRange>(defaultRange);
  const [appliedRange, setAppliedRange] = useState<DateRange>(defaultRange);
  const [type, setTypeState] = useState<'expense' | 'income'>('expense');
  const [accountId, setAccountIdState] = useState('all');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  // true una vez que la selección refleja al usuario (top-8 automático o un
  // toggle manual) — un cambio de `type` lo vuelve a poner en false (criterio 4).
  const selectionInitializedRef = useRef(false);

  const rangeError = isValidRange(draftRange.startDate, draftRange.endDate)
    ? null
    : RANGE_ERROR_MESSAGE;

  const filters: AnalysisFilters = useMemo(
    () => ({ startDate: appliedRange.startDate, endDate: appliedRange.endDate, type, accountId }),
    [appliedRange.startDate, appliedRange.endDate, type, accountId]
  );

  const { months, series, loading, error, reload } = useCategoryMonthlySeries(filters);

  useEffect(() => {
    // Mientras carga o hay error, `series` puede venir vacía por la
    // transición de queryKey (no por falta real de datos) — podar aquí
    // vaciaría la selección de golpe. Se espera al próximo dato estable.
    if (loading || error) return;

    setSelectedCategoryIds((prev) => {
      if (!selectionInitializedRef.current) {
        selectionInitializedRef.current = true;
        return pickDefaultSelection(series);
      }
      return pruneSelection(prev, series);
    });
  }, [series, loading, error]);

  const setDraftStartDate = useCallback((startDate: string) => {
    setDraftRange((prev) => {
      const next = { ...prev, startDate };
      if (isValidRange(next.startDate, next.endDate)) setAppliedRange(next);
      return next;
    });
  }, []);

  const setDraftEndDate = useCallback((endDate: string) => {
    setDraftRange((prev) => {
      const next = { ...prev, endDate };
      if (isValidRange(next.startDate, next.endDate)) setAppliedRange(next);
      return next;
    });
  }, []);

  const setType = useCallback((nextType: 'expense' | 'income') => {
    setTypeState(nextType);
    selectionInitializedRef.current = false;
  }, []);

  const setAccountId = useCallback((nextAccountId: string) => {
    setAccountIdState(nextAccountId);
  }, []);

  const toggleCategory = useCallback((categoryId: string) => {
    selectionInitializedRef.current = true;
    setSelectedCategoryIds((prev) => {
      const isSelected = prev.includes(categoryId);
      if (!isSelected && prev.length >= MAX_SELECTED_CATEGORIES) return prev;
      return isSelected ? prev.filter((id) => id !== categoryId) : [...prev, categoryId];
    });
  }, []);

  const emptyState: AnalysisEmptyState = useMemo(() => {
    if (error) return 'error';
    if (loading) return null;
    if (series.length === 0) return accountId !== 'all' ? 'account-no-data' : 'no-data';
    if (selectedCategoryIds.length === 0) return 'no-selection';
    return null;
  }, [error, loading, series, accountId, selectedCategoryIds]);

  return {
    draftRange,
    appliedRange,
    rangeError,
    type,
    accountId,
    accounts,
    selectedCategoryIds,
    isSelectionFull: selectedCategoryIds.length >= MAX_SELECTED_CATEGORIES,
    months,
    series,
    loading,
    emptyState,
    setDraftStartDate,
    setDraftEndDate,
    setType,
    setAccountId,
    toggleCategory,
    reload,
  };
}
