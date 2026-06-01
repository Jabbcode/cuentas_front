import { useBudgets } from './useBudgets';
import type { UseBudgetWidgetReturn } from '../types';

export function useBudgetWidget(): UseBudgetWidgetReturn {
  const now = new Date();
  const { budgets, loading } = useBudgets(now.getMonth() + 1, now.getFullYear());
  return { budgets, loading };
}
