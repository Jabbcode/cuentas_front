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
 * `enabled` deja la query en pausa mientras el rango de fechas en borrador es
 * inválido (D8): la gráfica se queda con el último resultado válido, sin
 * disparar una petición nueva por cada tecla mientras se corrige la fecha.
 */
export function useCategoryMonthlySeries(
  filters: AnalysisFilters,
  enabled: boolean = true
): UseCategoryMonthlySeriesReturn {
  const query = useQuery<CategoryMonthlySeriesResponse, Error>({
    queryKey: ['analysis', 'category-series', filters],
    queryFn: async () => {
      try {
        return await analysisApi.getCategoryMonthlySeries(filters);
      } catch {
        toast.error('No se pudo cargar la gráfica de categorías');
        throw new Error('Error al cargar la gráfica de categorías');
      }
    },
    enabled,
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
