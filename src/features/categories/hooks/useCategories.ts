import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../api';
import { logger } from '../../../lib/logger';
import type { Category } from '../../../types';
import type { UseCategoriesReturn } from '../types';

export function useCategories(): UseCategoriesReturn {
  const query = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        return await categoriesApi.getAll();
      } catch (err) {
        logger.error('category', 'Failed to load categories', err);
        throw new Error('Error al cargar las categorías. Intenta de nuevo.');
      }
    },
  });

  return {
    categories: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    reload: () => {
      void query.refetch();
    },
  };
}
