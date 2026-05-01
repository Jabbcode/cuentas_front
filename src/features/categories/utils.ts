import type { Category } from '../../types';
import type { CategoryFormData, CategoryPayload } from './types';
import { DEFAULT_ICON } from '../../lib/category-icons';

export const CATEGORY_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
] as const;

export const DEFAULT_FORM_DATA: CategoryFormData = {
  name: '',
  type: 'expense',
  icon: DEFAULT_ICON,
  color: '#3B82F6',
  monthlyLimit: '',
};

export function buildCategoryPayload(formData: CategoryFormData): CategoryPayload {
  return {
    name: formData.name,
    type: formData.type,
    icon: formData.icon,
    color: formData.color,
    monthlyLimit: formData.monthlyLimit ? parseFloat(formData.monthlyLimit) : null,
  };
}

export function buildFormDataFromCategory(category: Category): CategoryFormData {
  return {
    name: category.name,
    type: category.type,
    icon: category.icon ?? DEFAULT_ICON,
    color: category.color ?? '#3B82F6',
    monthlyLimit: category.monthlyLimit != null ? category.monthlyLimit.toString() : '',
  };
}

export function filterCategoriesByType(
  categories: Category[],
  type: 'expense' | 'income'
): Category[] {
  return categories.filter((c) => c.type === type);
}
