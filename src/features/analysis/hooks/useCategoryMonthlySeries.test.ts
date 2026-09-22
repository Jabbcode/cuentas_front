import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryClientWrapper } from '../../../test-utils/query-client';
import { useCategoryMonthlySeries } from './useCategoryMonthlySeries';
import type { CategoryMonthlySeriesResponse, AnalysisFilters } from '../types';

vi.mock('../api', () => ({
  analysisApi: { getCategoryMonthlySeries: vi.fn() },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { analysisApi } from '../api';

const FILTERS: AnalysisFilters = {
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  type: 'expense',
  accountId: 'all',
};

describe('useCategoryMonthlySeries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga months y series en éxito', async () => {
    const body: CategoryMonthlySeriesResponse = {
      months: ['2026-01'],
      series: [
        {
          category: { id: 'c1', name: 'Comida', icon: null, color: null },
          total: 100,
          points: [{ month: '2026-01', total: 100, count: 1 }],
        },
      ],
    };
    vi.mocked(analysisApi.getCategoryMonthlySeries).mockResolvedValue(body);

    const { result } = renderHook(() => useCategoryMonthlySeries(FILTERS), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.months).toEqual(body.months);
    expect(result.current.series).toEqual(body.series);
  });

  it('deja months/series vacíos y no llama a la API cuando enabled=false', async () => {
    const { result } = renderHook(() => useCategoryMonthlySeries(FILTERS, false), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.months).toEqual([]);
    expect(result.current.series).toEqual([]);
    expect(analysisApi.getCategoryMonthlySeries).not.toHaveBeenCalled();
  });

  it('reload dispara un refetch', async () => {
    vi.mocked(analysisApi.getCategoryMonthlySeries).mockResolvedValue({ months: [], series: [] });

    const { result } = renderHook(() => useCategoryMonthlySeries(FILTERS), {
      wrapper: createQueryClientWrapper(),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    result.current.reload();

    await waitFor(() => expect(analysisApi.getCategoryMonthlySeries).toHaveBeenCalledTimes(2));
  });

  it('dos juegos de filtros distintos producen queryKeys distintas', async () => {
    vi.mocked(analysisApi.getCategoryMonthlySeries).mockResolvedValue({ months: [], series: [] });
    const other: AnalysisFilters = { ...FILTERS, type: 'income' };

    const { rerender } = renderHook(({ filters }) => useCategoryMonthlySeries(filters), {
      wrapper: createQueryClientWrapper(),
      initialProps: { filters: FILTERS },
    });
    await waitFor(() => expect(analysisApi.getCategoryMonthlySeries).toHaveBeenCalledTimes(1));

    rerender({ filters: other });
    await waitFor(() => expect(analysisApi.getCategoryMonthlySeries).toHaveBeenCalledTimes(2));

    expect(analysisApi.getCategoryMonthlySeries).toHaveBeenNthCalledWith(1, FILTERS);
    expect(analysisApi.getCategoryMonthlySeries).toHaveBeenNthCalledWith(2, other);
  });

  it('una respuesta tardía de una combinación de filtros ya reemplazada no pisa los datos de la combinación vigente (D9)', async () => {
    let resolveOld!: (v: CategoryMonthlySeriesResponse) => void;
    let resolveNew!: (v: CategoryMonthlySeriesResponse) => void;
    const oldPromise = new Promise<CategoryMonthlySeriesResponse>((res) => {
      resolveOld = res;
    });
    const newPromise = new Promise<CategoryMonthlySeriesResponse>((res) => {
      resolveNew = res;
    });
    vi.mocked(analysisApi.getCategoryMonthlySeries)
      .mockReturnValueOnce(oldPromise)
      .mockReturnValueOnce(newPromise);

    const filtersNew: AnalysisFilters = {
      ...FILTERS,
      startDate: '2026-02-01',
      endDate: '2026-02-28',
    };

    const { result, rerender } = renderHook(({ filters }) => useCategoryMonthlySeries(filters), {
      wrapper: createQueryClientWrapper(),
      initialProps: { filters: FILTERS },
    });
    rerender({ filters: filtersNew });

    resolveNew({
      months: ['2026-02'],
      series: [
        { category: { id: 'c1', name: 'X', icon: null, color: null }, total: 5, points: [] },
      ],
    });
    await waitFor(() => expect(result.current.months).toEqual(['2026-02']));

    resolveOld({ months: ['2026-01'], series: [] });
    await new Promise((r) => setTimeout(r, 0));

    expect(result.current.months).toEqual(['2026-02']);
  });
});
