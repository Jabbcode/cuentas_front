import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccounts } from '../../accounts/hooks/useAccounts';
import { useCategoryMonthlySeries } from './useCategoryMonthlySeries';
import { useCategorySelection } from './useCategorySelection';
import { getDefaultAnalysisRange, isValidRange, monthKeyToDateRange } from '../utils';
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
  onPointClick: (categoryId: string, month: string, count: number) => void;
  reload: () => void;
}

/**
 * Estado completo de la página Análisis (ADR-005: la página es UI pura, toda
 * la lógica vive aquí). Nada persiste entre montajes — criterio 8, sin
 * localStorage/sessionStorage/query params — cada `useState` arranca en su
 * valor por defecto cada vez que el componente se monta.
 *
 * Orquesta tres piezas: el rango de fechas (draft/applied), la query de
 * datos (`useCategoryMonthlySeries`) y la selección de categorías
 * (`useCategorySelection`) — el ciclo de vida de la selección en sí vive en
 * ese hook aparte.
 */
export function useAnalysisPage(): UseAnalysisPageReturn {
  const navigate = useNavigate();
  const { accounts } = useAccounts();

  const defaultRange = useMemo(() => getDefaultAnalysisRange(), []);
  const [draftRange, setDraftRange] = useState<DateRange>(defaultRange);
  const [appliedRange, setAppliedRange] = useState<DateRange>(defaultRange);
  const [type, setTypeState] = useState<'expense' | 'income'>('expense');
  const [accountId, setAccountIdState] = useState('all');

  const rangeError = isValidRange(draftRange.startDate, draftRange.endDate)
    ? null
    : RANGE_ERROR_MESSAGE;

  const filters: AnalysisFilters = useMemo(
    () => ({ startDate: appliedRange.startDate, endDate: appliedRange.endDate, type, accountId }),
    [appliedRange.startDate, appliedRange.endDate, type, accountId]
  );

  const { months, series, loading, error, reload } = useCategoryMonthlySeries(filters);
  const { selectedCategoryIds, isSelectionFull, toggleCategory, resetSelection } =
    useCategorySelection(series, loading, error);

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

  const setType = useCallback(
    (nextType: 'expense' | 'income') => {
      setTypeState(nextType);
      resetSelection();
    },
    [resetSelection]
  );

  const setAccountId = useCallback((nextAccountId: string) => {
    setAccountIdState(nextAccountId);
  }, []);

  const onPointClick = useCallback(
    (categoryId: string, month: string, count: number) => {
      if (count === 0) return;
      const { startDate, endDate } = monthKeyToDateRange(month);
      const params = new URLSearchParams({ startDate, endDate, type, categoryIds: categoryId });
      if (accountId !== 'all') params.set('accountId', accountId);
      navigate(`/transactions?${params.toString()}`);
    },
    [navigate, type, accountId]
  );

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
    isSelectionFull,
    months,
    series,
    loading,
    emptyState,
    setDraftStartDate,
    setDraftEndDate,
    setType,
    setAccountId,
    toggleCategory,
    onPointClick,
    reload,
  };
}
