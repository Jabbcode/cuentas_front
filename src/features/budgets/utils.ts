import type { Budget, Category } from '../../types';

export const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

/**
 * Returns the display label for a month index (1-based).
 */
export function getMonthLabel(month: number): string {
  return MONTHS[month - 1] ?? '';
}

/**
 * Computes the previous month and year, wrapping from January to December.
 */
export function getPrevMonthYear(month: number, year: number): { month: number; year: number } {
  if (month === 1) return { month: 12, year: year - 1 };
  return { month: month - 1, year };
}

/**
 * Computes the next month and year, wrapping from December to January.
 */
export function getNextMonthYear(month: number, year: number): { month: number; year: number } {
  if (month === 12) return { month: 1, year: year + 1 };
  return { month: month + 1, year };
}

/**
 * Filters out categories that already have a budget for the given period.
 * When editing an existing budget, all categories remain available.
 */
export function getAvailableCategories(
  categories: Category[],
  budgets: Budget[],
  editingBudget: Budget | null
): Category[] {
  if (editingBudget) return categories;
  const budgetedIds = new Set(budgets.map((b) => b.categoryId));
  return categories.filter((c) => !budgetedIds.has(c.id));
}
