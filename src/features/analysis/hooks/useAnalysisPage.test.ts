import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAnalysisPage } from './useAnalysisPage';
import type { CategorySeries } from '../types';
import type { UseCategoryMonthlySeriesReturn } from './useCategoryMonthlySeries';

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('./useCategoryMonthlySeries', () => ({
  useCategoryMonthlySeries: vi.fn(),
}));

vi.mock('../../accounts/hooks/useAccounts', () => ({
  useAccounts: vi.fn(() => ({ accounts: [], loading: false, error: null, reload: vi.fn() })),
}));

import { useCategoryMonthlySeries } from './useCategoryMonthlySeries';

function fakeSeries(ids: string[]): CategorySeries[] {
  return ids.map((id) => ({
    category: { id, name: id, icon: null, color: null },
    total: 0,
    points: [],
  }));
}

function mockSeriesReturn(overrides: Partial<UseCategoryMonthlySeriesReturn> = {}) {
  vi.mocked(useCategoryMonthlySeries).mockReturnValue({
    months: [],
    series: [],
    loading: false,
    error: null,
    reload: vi.fn(),
    ...overrides,
  });
}

describe('useAnalysisPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('valores por defecto: type expense, accountId all, sin selección todavía', () => {
    mockSeriesReturn();
    const { result } = renderHook(() => useAnalysisPage());

    expect(result.current.type).toBe('expense');
    expect(result.current.accountId).toBe('all');
    expect(result.current.rangeError).toBeNull();
  });

  it('selecciona hasta 8 categorías por defecto (top-8 ya ordenado por el backend)', async () => {
    const ids = Array.from({ length: 10 }, (_, i) => `cat-${i}`);
    mockSeriesReturn({ series: fakeSeries(ids) });

    const { result } = renderHook(() => useAnalysisPage());

    await waitFor(() => expect(result.current.selectedCategoryIds).toEqual(ids.slice(0, 8)));
  });

  it('cambiar el toggle Gasto/Ingreso reaplica la preselección top-8 para el tipo nuevo', async () => {
    const idsExpense = Array.from({ length: 10 }, (_, i) => `exp-${i}`);
    const idsIncome = Array.from({ length: 9 }, (_, i) => `inc-${i}`);
    mockSeriesReturn({ series: fakeSeries(idsExpense) });

    const { result } = renderHook(() => useAnalysisPage());
    await waitFor(() => expect(result.current.selectedCategoryIds).toEqual(idsExpense.slice(0, 8)));

    mockSeriesReturn({ series: fakeSeries(idsIncome) });
    act(() => result.current.setType('income'));

    expect(result.current.type).toBe('income');
    await waitFor(() => expect(result.current.selectedCategoryIds).toEqual(idsIncome.slice(0, 8)));
  });

  it('cambiar de cuenta conserva la selección vigente y solo poda las categorías sin movimiento en la cuenta nueva', async () => {
    mockSeriesReturn({ series: fakeSeries(['a', 'b', 'c']) });
    const { result } = renderHook(() => useAnalysisPage());
    await waitFor(() => expect(result.current.selectedCategoryIds).toEqual(['a', 'b', 'c']));

    mockSeriesReturn({ series: fakeSeries(['a', 'c']) }); // 'b' ya no tiene movimiento en la cuenta nueva
    act(() => result.current.setAccountId('acc-1'));

    expect(result.current.accountId).toBe('acc-1');
    await waitFor(() => expect(result.current.selectedCategoryIds).toEqual(['a', 'c']));
  });

  it('cambiar el rango de fechas conserva la selección vigente y solo poda las categorías sin movimiento en el rango nuevo', async () => {
    mockSeriesReturn({ series: fakeSeries(['a', 'b', 'c']) });
    const { result } = renderHook(() => useAnalysisPage());
    await waitFor(() => expect(result.current.selectedCategoryIds).toEqual(['a', 'b', 'c']));

    mockSeriesReturn({ series: fakeSeries(['a', 'c']) }); // 'b' sin movimiento en todo el rango nuevo
    act(() => result.current.setDraftStartDate('2026-06-01'));

    expect(result.current.appliedRange.startDate).toBe('2026-06-01');
    await waitFor(() => expect(result.current.selectedCategoryIds).toEqual(['a', 'c']));
  });

  it('intentar seleccionar una 9ª categoría no cambia la selección; isSelectionFull queda true', async () => {
    const ids = Array.from({ length: 9 }, (_, i) => `cat-${i}`);
    mockSeriesReturn({ series: fakeSeries(ids) });
    const { result } = renderHook(() => useAnalysisPage());
    await waitFor(() => expect(result.current.selectedCategoryIds).toHaveLength(8));

    expect(result.current.isSelectionFull).toBe(true);

    act(() => result.current.toggleCategory('cat-8'));

    expect(result.current.selectedCategoryIds).toHaveLength(8);
    expect(result.current.selectedCategoryIds).not.toContain('cat-8');
  });

  it('desmarcar una categoría habilita marcar otra distinta', async () => {
    const ids = Array.from({ length: 9 }, (_, i) => `cat-${i}`);
    mockSeriesReturn({ series: fakeSeries(ids) });
    const { result } = renderHook(() => useAnalysisPage());
    await waitFor(() => expect(result.current.selectedCategoryIds).toHaveLength(8));

    act(() => result.current.toggleCategory('cat-0'));
    act(() => result.current.toggleCategory('cat-8'));

    expect(result.current.selectedCategoryIds).toContain('cat-8');
    expect(result.current.selectedCategoryIds).not.toContain('cat-0');
    expect(result.current.selectedCategoryIds).toHaveLength(8);
  });

  it('"desde" > "hasta" no actualiza appliedRange y expone rangeError', () => {
    mockSeriesReturn();
    const { result } = renderHook(() => useAnalysisPage());

    act(() => result.current.setDraftStartDate('2026-06-15'));
    const appliedAfterValidChange = result.current.appliedRange;
    expect(appliedAfterValidChange.startDate).toBe('2026-06-15');

    act(() => result.current.setDraftEndDate('2026-01-01'));

    expect(result.current.rangeError).not.toBeNull();
    expect(result.current.appliedRange).toEqual(appliedAfterValidChange);
    expect(result.current.draftRange.endDate).toBe('2026-01-01');
  });

  describe('emptyState', () => {
    it('"error" cuando la query falla', () => {
      mockSeriesReturn({ error: 'boom' });
      const { result } = renderHook(() => useAnalysisPage());

      expect(result.current.emptyState).toBe('error');
    });

    it('"no-data" cuando no hay series y la cuenta es "all"', () => {
      mockSeriesReturn({ series: [] });
      const { result } = renderHook(() => useAnalysisPage());

      expect(result.current.emptyState).toBe('no-data');
    });

    it('"account-no-data" cuando no hay series y hay una cuenta específica', () => {
      mockSeriesReturn({ series: [] });
      const { result } = renderHook(() => useAnalysisPage());

      act(() => result.current.setAccountId('acc-1'));

      expect(result.current.emptyState).toBe('account-no-data');
    });

    it('"no-selection" cuando hay series pero ninguna categoría seleccionada', async () => {
      mockSeriesReturn({ series: fakeSeries(['a']) });
      const { result } = renderHook(() => useAnalysisPage());
      await waitFor(() => expect(result.current.selectedCategoryIds).toEqual(['a']));

      act(() => result.current.toggleCategory('a'));

      expect(result.current.emptyState).toBe('no-selection');
    });

    it('null mientras loading, aunque no haya series todavía', () => {
      mockSeriesReturn({ series: [], loading: true });
      const { result } = renderHook(() => useAnalysisPage());

      expect(result.current.emptyState).toBeNull();
    });
  });

  describe('onPointClick (T8: navegación a Transacciones filtrada)', () => {
    it('construye la URL exacta para un punto de un mes de 31 días y navega', () => {
      mockSeriesReturn();
      const { result } = renderHook(() => useAnalysisPage());

      act(() => result.current.onPointClick('cat-1', '2026-01', 3));

      expect(mockNavigate).toHaveBeenCalledWith(
        '/transactions?startDate=2026-01-01&endDate=2026-01-31&type=expense&categoryIds=cat-1'
      );
    });

    it('construye la URL exacta para un punto de un mes de 30 días', () => {
      mockSeriesReturn();
      const { result } = renderHook(() => useAnalysisPage());

      act(() => result.current.onPointClick('cat-1', '2026-04', 1));

      expect(mockNavigate).toHaveBeenCalledWith(
        '/transactions?startDate=2026-04-01&endDate=2026-04-30&type=expense&categoryIds=cat-1'
      );
    });

    it('construye la URL exacta para un punto de febrero', () => {
      mockSeriesReturn();
      const { result } = renderHook(() => useAnalysisPage());

      act(() => result.current.onPointClick('cat-1', '2026-02', 1));

      expect(mockNavigate).toHaveBeenCalledWith(
        '/transactions?startDate=2026-02-01&endDate=2026-02-28&type=expense&categoryIds=cat-1'
      );
    });

    it('incluye accountId en la URL solo cuando hay una cuenta específica seleccionada', () => {
      mockSeriesReturn();
      const { result } = renderHook(() => useAnalysisPage());

      act(() => result.current.setAccountId('acc-1'));
      act(() => result.current.onPointClick('cat-1', '2026-01', 2));

      expect(mockNavigate).toHaveBeenCalledWith(
        '/transactions?startDate=2026-01-01&endDate=2026-01-31&type=expense&categoryIds=cat-1&accountId=acc-1'
      );
    });

    it('no incluye accountId cuando el filtro está en "all"', () => {
      mockSeriesReturn();
      const { result } = renderHook(() => useAnalysisPage());

      act(() => result.current.onPointClick('cat-1', '2026-01', 1));

      const url = mockNavigate.mock.calls[0][0] as string;
      expect(url).not.toContain('accountId');
    });

    it('un punto con count 0 no navega', () => {
      mockSeriesReturn();
      const { result } = renderHook(() => useAnalysisPage());

      act(() => result.current.onPointClick('cat-1', '2026-01', 0));

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('al remontar el hook, todo vuelve a los valores por defecto (criterio 8)', () => {
    mockSeriesReturn();
    const first = renderHook(() => useAnalysisPage());
    act(() => first.result.current.setType('income'));
    act(() => first.result.current.setAccountId('acc-1'));
    first.unmount();

    const second = renderHook(() => useAnalysisPage());

    expect(second.result.current.type).toBe('expense');
    expect(second.result.current.accountId).toBe('all');
    expect(second.result.current.selectedCategoryIds).toEqual([]);
  });
});
