import { useQuery } from '@tanstack/react-query';
import { analysisApi } from '../api';
import { toast } from 'sonner';
import type { AnalysisFilters, CategoryMonthlySeriesResponse } from '../types';

export interface UseCategoryMonthlySeriesReturn {
  months: string[];
  series: CategoryMonthlySeriesResponse['series'];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Sin flag `enabled`: `filters` siempre viene de `appliedRange` en
 * `useAnalysisPage`, que por construcción (D8) solo se actualiza con rangos
 * ya validados — nunca hay un estado intermedio que deba pausar la query.
 */
export function useCategoryMonthlySeries(filters: AnalysisFilters): UseCategoryMonthlySeriesReturn {
  const query = useQuery<CategoryMonthlySeriesResponse, Error>({
    queryKey: ['analysis', 'category-series', filters],
    queryFn: async () => {
      try {
        return await analysisApi.getCategoryMonthlySeries(filters);
      } catch (err) {
        toast.error('No se pudo cargar la gráfica de categorías');
        throw new Error('Error al cargar la gráfica de categorías', { cause: err });
      }
    },
  });

  return {
    months: query.data?.months ?? [],
    series: query.data?.series ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    reload: () => {
      void query.refetch();
    },
  };
}
