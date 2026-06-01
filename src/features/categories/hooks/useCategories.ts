import { useState, useEffect, useCallback } from 'react';
import { categoriesApi } from '../api';
import { logger } from '../../../lib/logger';
import type { Category } from '../../../types';
import type { UseCategoriesReturn } from '../types';

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (err) {
      setError('Error al cargar las categorías. Intenta de nuevo.');
      logger.error('category', 'Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const reload = useCallback(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    reload,
  };
}
