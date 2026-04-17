import { useEffect, useState } from 'react';
import { categoriesApi } from '../../api/categories.api';
import { CategoryLimitBadge } from './CategoryLimitBadge';
import type { CategorySpending } from '../../types';

interface CategoryLimitDisplayProps {
  categoryId: string;
  monthlyLimit: number;
}

export function CategoryLimitDisplay({ categoryId, monthlyLimit }: CategoryLimitDisplayProps) {
  const [spending, setSpending] = useState<CategorySpending | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpending = async () => {
      try {
        const data = await categoriesApi.getSpending(categoryId);
        setSpending(data);
      } catch (error) {
        console.error('Error loading category spending:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSpending();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
    );
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
