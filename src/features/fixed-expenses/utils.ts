import type { FixedExpenseSummary } from '../../types';
import type { CategoryInfo, FixedExpenseWithStatus } from './types';

/** Extract unique categories from expense items (no credit-card or debt-payment items). */
export function getExpenseCategories(summary: FixedExpenseSummary | null): CategoryInfo[] {
  if (!summary) return [];
  const categories = new Map<string, CategoryInfo>();
  summary.items
    .filter(
      (item) =>
        item.type === 'expense' &&
        item.category &&
        !item.creditCardAccountId &&
        !item.recurringDebtPaymentId
    )
    .forEach((item) => {
      if (item.category && !categories.has(item.category.id)) {
        categories.set(item.category.id, item.category);
      }
    });
  return Array.from(categories.values());
}

/** Extract unique categories from income items. */
export function getIncomeCategories(summary: FixedExpenseSummary | null): CategoryInfo[] {
  if (!summary) return [];
  const categories = new Map<string, CategoryInfo>();
  summary.items
    .filter((item) => item.type === 'income' && item.category)
    .forEach((item) => {
      if (item.category && !categories.has(item.category.id)) {
        categories.set(item.category.id, item.category);
      }
    });
  return Array.from(categories.values());
}

/** Filter and sort regular expense items by category selection and dueDay. */
export function getFilteredExpenseItems(
  summary: FixedExpenseSummary | null,
  selectedCategories: string[]
): FixedExpenseWithStatus[] {
  if (!summary) return [];
  const items = summary.items.filter(
    (item) => item.type === 'expense' && !item.creditCardAccountId && !item.recurringDebtPaymentId
  ) as FixedExpenseWithStatus[];
  const filtered =
    selectedCategories.length === 0
      ? items
      : items.filter((item) => item.category && selectedCategories.includes(item.category.id));
  return [...filtered].sort((a, b) => a.dueDay - b.dueDay);
}

/** Filter and sort income items by category selection and dueDay. */
export function getFilteredIncomeItems(
  summary: FixedExpenseSummary | null,
  selectedCategories: string[]
): FixedExpenseWithStatus[] {
  if (!summary) return [];
  const items = summary.items.filter((item) => item.type === 'income') as FixedExpenseWithStatus[];
  const filtered =
    selectedCategories.length === 0
      ? items
      : items.filter((item) => item.category && selectedCategories.includes(item.category.id));
  return [...filtered].sort((a, b) => a.dueDay - b.dueDay);
}

/** Get active credit-card items sorted by dueDay. */
export function getCreditCardItems(summary: FixedExpenseSummary | null): FixedExpenseWithStatus[] {
  if (!summary) return [];
  return summary.items
    .filter((item) => item.creditCardAccountId && item.isActive)
    .sort((a, b) => a.dueDay - b.dueDay) as FixedExpenseWithStatus[];
}

/** Get active debt-payment items sorted by dueDay. */
export function getDebtPaymentItems(summary: FixedExpenseSummary | null): FixedExpenseWithStatus[] {
  if (!summary) return [];
  return summary.items
    .filter((item) => item.recurringDebtPaymentId && item.isActive)
    .sort((a, b) => a.dueDay - b.dueDay) as FixedExpenseWithStatus[];
}

/** Sum active item amounts. */
export function sumActiveAmounts(items: FixedExpenseWithStatus[]): number {
  return items.filter((item) => item.isActive).reduce((sum, item) => sum + Number(item.amount), 0);
}

/** Toggle a category id in/out of a selection array (pure). */
export function toggleCategorySelection(prev: string[], categoryId: string): string[] {
  return prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId];
}
