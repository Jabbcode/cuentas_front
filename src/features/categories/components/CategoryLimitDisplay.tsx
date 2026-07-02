import { useEffect, useState } from 'react';
import { categoriesApi } from '../api';
import { CategoryLimitBadge } from './CategoryLimitBadge';
import type { CategorySpending } from '../../../types';

interface CategoryLimitDisplayProps {
  categoryId: string;
}

export function CategoryLimitDisplay({ categoryId }: CategoryLimitDisplayProps) {
  const [spending, setSpending] = useState<CategorySpending | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadSpending = async () => {
      try {
        const data = await categoriesApi.getSpending(categoryId);
        if (!cancelled) setSpending(data);
      } catch (error) {
        console.error('Error loading category spending:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadSpending();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  if (loading) {
    return <div className="h-4 w-16 motion-safe:animate-pulse rounded bg-gray-200" />;
  }

  if (!spending) return null;

  return (
    <CategoryLimitBadge
      spent={spending.spent}
      limit={spending.limit}
      percentage={spending.percentage}
      compact
    />
  );
}
