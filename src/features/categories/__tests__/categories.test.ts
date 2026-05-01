import { describe, it, expect } from 'vitest';
import type { Category } from '../../../types';
import {
  buildCategoryPayload,
  buildFormDataFromCategory,
  filterCategoriesByType,
  DEFAULT_FORM_DATA,
} from '../utils';
import type { CategoryFormData } from '../types';
import { DEFAULT_ICON } from '../../../lib/category-icons';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeExpenseCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 'cat-1',
  name: 'Alimentación',
  type: 'expense',
  icon: 'Utensils',
  color: '#10B981',
  monthlyLimit: 500,
  ...overrides,
});

const makeIncomeCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 'cat-2',
  name: 'Salario',
  type: 'income',
  icon: 'Briefcase',
  color: '#3B82F6',
  monthlyLimit: null,
  ...overrides,
});

// ─── filterCategoriesByType ───────────────────────────────────────────────────

describe('filterCategoriesByType', () => {
  it('filters only expense categories', () => {
    const categories: Category[] = [
      makeExpenseCategory({ id: 'e1' }),
      makeExpenseCategory({ id: 'e2' }),
      makeIncomeCategory(),
    ];

    const result = filterCategoriesByType(categories, 'expense');

    expect(result).toHaveLength(2);
    expect(result.every((c) => c.type === 'expense')).toBe(true);
  });

  it('filters only income categories', () => {
    const categories: Category[] = [
      makeExpenseCategory(),
      makeIncomeCategory({ id: 'i1' }),
      makeIncomeCategory({ id: 'i2' }),
    ];

    const result = filterCategoriesByType(categories, 'income');

    expect(result).toHaveLength(2);
    expect(result.every((c) => c.type === 'income')).toBe(true);
  });

  it('returns empty array when no categories match', () => {
    const categories: Category[] = [makeExpenseCategory()];
    const result = filterCategoriesByType(categories, 'income');
    expect(result).toHaveLength(0);
  });

  it('returns empty array for empty input', () => {
    const result = filterCategoriesByType([], 'expense');
    expect(result).toHaveLength(0);
  });
});

// ─── buildCategoryPayload ─────────────────────────────────────────────────────

describe('buildCategoryPayload', () => {
  it('parses monthlyLimit string to float', () => {
    const formData: CategoryFormData = {
      name: 'Alimentación',
      type: 'expense',
      icon: 'Utensils',
      color: '#10B981',
      monthlyLimit: '500.50',
    };

    const result = buildCategoryPayload(formData);

    expect(result.monthlyLimit).toBe(500.5);
  });

  it('sets monthlyLimit to null when empty string', () => {
    const formData: CategoryFormData = {
      name: 'Salario',
      type: 'income',
      icon: 'Briefcase',
      color: '#3B82F6',
      monthlyLimit: '',
    };

    const result = buildCategoryPayload(formData);

    expect(result.monthlyLimit).toBeNull();
  });

  it('preserves all other fields correctly', () => {
    const formData: CategoryFormData = {
      name: 'Transporte',
      type: 'expense',
      icon: 'Car',
      color: '#EF4444',
      monthlyLimit: '200',
    };

    const result = buildCategoryPayload(formData);

    expect(result.name).toBe('Transporte');
    expect(result.type).toBe('expense');
    expect(result.icon).toBe('Car');
    expect(result.color).toBe('#EF4444');
  });
});

// ─── buildFormDataFromCategory ────────────────────────────────────────────────

describe('buildFormDataFromCategory', () => {
  it('maps category fields to form data correctly', () => {
    const category = makeExpenseCategory({
      name: 'Alimentación',
      icon: 'Utensils',
      color: '#10B981',
      monthlyLimit: 500,
    });

    const result = buildFormDataFromCategory(category);

    expect(result.name).toBe('Alimentación');
    expect(result.type).toBe('expense');
    expect(result.icon).toBe('Utensils');
    expect(result.color).toBe('#10B981');
    expect(result.monthlyLimit).toBe('500');
  });

  it('converts null monthlyLimit to empty string', () => {
    const category = makeIncomeCategory({ monthlyLimit: null });
    const result = buildFormDataFromCategory(category);
    expect(result.monthlyLimit).toBe('');
  });

  it('converts undefined monthlyLimit to empty string', () => {
    const category = makeExpenseCategory({ monthlyLimit: undefined });
    const result = buildFormDataFromCategory(category);
    expect(result.monthlyLimit).toBe('');
  });

  it('falls back to DEFAULT_ICON when category icon is undefined', () => {
    const category = makeExpenseCategory({ icon: undefined });
    const result = buildFormDataFromCategory(category);
    expect(result.icon).toBe(DEFAULT_ICON);
  });

  it('falls back to default color when category color is undefined', () => {
    const category = makeExpenseCategory({ color: undefined });
    const result = buildFormDataFromCategory(category);
    expect(result.color).toBe('#3B82F6');
  });
});

// ─── DEFAULT_FORM_DATA ────────────────────────────────────────────────────────

describe('DEFAULT_FORM_DATA', () => {
  it('has expense as default type', () => {
    expect(DEFAULT_FORM_DATA.type).toBe('expense');
  });

  it('has empty monthlyLimit by default', () => {
    expect(DEFAULT_FORM_DATA.monthlyLimit).toBe('');
  });

  it('has DEFAULT_ICON as default icon', () => {
    expect(DEFAULT_FORM_DATA.icon).toBe(DEFAULT_ICON);
  });

  it('has empty name by default', () => {
    expect(DEFAULT_FORM_DATA.name).toBe('');
  });
});
