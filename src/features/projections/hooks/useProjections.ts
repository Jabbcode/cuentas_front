import { useQuery } from '@tanstack/react-query';
import { projectionsApi } from '../api';
import type { UseProjectionsReturn } from '../types';

export function useProjections(days: number): UseProjectionsReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projections', days],
    queryFn: () => projectionsApi.get(days),
  });

  return { data, isLoading, error: error as Error | null };
}
