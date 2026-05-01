import { describe, it, expect } from 'vitest';
import {
  getMonthLabel,
  getPrevMonthYear,
  getNextMonthYear,
  getAvailableCategories,
} from '../utils';
import type { Budget, Category } from '../../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCategory(id: string): Category {
  return {
    id,
    name: `Category ${id}`,
    type: 'expense',
    icon: 'tag',
    color: '#000000',
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function makeBudget(id: string, categoryId: string): Budget {
  return {
    id,
    categoryId,
    category: { id: categoryId, name: `Cat ${categoryId}`, icon: 'tag', color: '#000' },
    amount: 500,
    month: 5,
    year: 2026,
    alertAt: 80,
    spent: 100,
    remaining: 400,
    percentage: 20,
    isOverBudget: false,
    isNearLimit: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// getMonthLabel
// ---------------------------------------------------------------------------

describe('getMonthLabel', () => {
  it('returns correct label for January (month=1)', () => {
    expect(getMonthLabel(1)).toBe('Enero');
  });

  it('returns correct label for December (month=12)', () => {
    expect(getMonthLabel(12)).toBe('Diciembre');
  });

  it('returns empty string for out-of-range month', () => {
    expect(getMonthLabel(0)).toBe('');
    expect(getMonthLabel(13)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// getPrevMonthYear
// ---------------------------------------------------------------------------

describe('getPrevMonthYear', () => {
  it('decrements month within the same year', () => {
    expect(getPrevMonthYear(6, 2026)).toEqual({ month: 5, year: 2026 });
  });

  it('wraps from January to December of the previous year', () => {
    expect(getPrevMonthYear(1, 2026)).toEqual({ month: 12, year: 2025 });
  });
});

// ---------------------------------------------------------------------------
// getNextMonthYear
// ---------------------------------------------------------------------------

describe('getNextMonthYear', () => {
  it('increments month within the same year', () => {
    expect(getNextMonthYear(5, 2026)).toEqual({ month: 6, year: 2026 });
  });

  it('wraps from December to January of the next year', () => {
    expect(getNextMonthYear(12, 2026)).toEqual({ month: 1, year: 2027 });
  });
});

// ---------------------------------------------------------------------------
// getAvailableCategories
// ---------------------------------------------------------------------------

describe('getAvailableCategories', () => {
  const catA = makeCategory('a');
  const catB = makeCategory('b');
  const catC = makeCategory('c');
  const categories = [catA, catB, catC];

  it('returns all categories when editing an existing budget', () => {
    const budgets = [makeBudget('b1', 'a'), makeBudget('b2', 'b')];
    const editing = makeBudget('b1', 'a');
    const result = getAvailableCategories(categories, budgets, editing);
    expect(result).toHaveLength(3);
  });

  it('filters out already-budgeted categories when creating', () => {
    const budgets = [makeBudget('b1', 'a'), makeBudget('b2', 'b')];
    const result = getAvailableCategories(categories, budgets, null);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c');
  });

  it('returns all categories when no budgets exist', () => {
    const result = getAvailableCategories(categories, [], null);
    expect(result).toHaveLength(3);
  });

  it('returns empty array when all categories are budgeted', () => {
    const budgets = [makeBudget('b1', 'a'), makeBudget('b2', 'b'), makeBudget('b3', 'c')];
    const result = getAvailableCategories(categories, budgets, null);
    expect(result).toHaveLength(0);
  });
});
