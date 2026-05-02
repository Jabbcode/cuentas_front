import { describe, it, expect } from 'vitest';
import type { FixedExpenseSummary } from '../../../types';
import type { FixedExpenseWithStatus } from '../types';
import {
  getExpenseCategories,
  getIncomeCategories,
  getFilteredExpenseItems,
  getFilteredIncomeItems,
  getCreditCardItems,
  getDebtPaymentItems,
  sumActiveAmounts,
  toggleCategorySelection,
} from '../utils';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeItem = (overrides: Partial<FixedExpenseWithStatus> = {}): FixedExpenseWithStatus => ({
  id: 'fe-1',
  userId: 'user-1',
  name: 'Internet',
  amount: 500,
  type: 'expense',
  dueDay: 5,
  isActive: true,
  autoGenerate: false,
  accountId: 'acc-1',
  categoryId: 'cat-1',
  isPaidThisMonth: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  category: { id: 'cat-1', name: 'Servicios', icon: 'Wifi', color: '#3B82F6' },
  ...overrides,
});

const makeSummary = (items: FixedExpenseWithStatus[]): FixedExpenseSummary => ({
  totalMonthlyExpenses: 0,
  totalMonthlyIncome: 0,
  paidCount: 0,
  pendingCount: 0,
  items,
});

// ─── getExpenseCategories ─────────────────────────────────────────────────────

describe('getExpenseCategories', () => {
  it('returns null for null summary', () => {
    expect(getExpenseCategories(null)).toHaveLength(0);
  });

  it('returns unique categories from expense items', () => {
    const summary = makeSummary([
      makeItem({ id: 'fe-1', type: 'expense', category: { id: 'cat-1', name: 'Servicios' } }),
      makeItem({ id: 'fe-2', type: 'expense', category: { id: 'cat-1', name: 'Servicios' } }),
      makeItem({ id: 'fe-3', type: 'expense', category: { id: 'cat-2', name: 'Alimentación' } }),
    ]);

    const result = getExpenseCategories(summary);

    expect(result).toHaveLength(2);
    expect(result.map((c) => c.id)).toContain('cat-1');
    expect(result.map((c) => c.id)).toContain('cat-2');
  });

  it('excludes income items', () => {
    const summary = makeSummary([
      makeItem({ type: 'income', category: { id: 'cat-income', name: 'Salario' } }),
    ]);
    expect(getExpenseCategories(summary)).toHaveLength(0);
  });

  it('excludes credit card items', () => {
    const summary = makeSummary([makeItem({ type: 'expense', creditCardAccountId: 'cc-1' })]);
    expect(getExpenseCategories(summary)).toHaveLength(0);
  });

  it('excludes debt payment items', () => {
    const summary = makeSummary([makeItem({ type: 'expense', recurringDebtPaymentId: 'rdp-1' })]);
    expect(getExpenseCategories(summary)).toHaveLength(0);
  });
});

// ─── getIncomeCategories ──────────────────────────────────────────────────────

describe('getIncomeCategories', () => {
  it('returns empty array for null summary', () => {
    expect(getIncomeCategories(null)).toHaveLength(0);
  });

  it('returns unique categories from income items only', () => {
    const summary = makeSummary([
      makeItem({ id: 'fe-1', type: 'income', category: { id: 'cat-income', name: 'Salario' } }),
      makeItem({ id: 'fe-2', type: 'income', category: { id: 'cat-income', name: 'Salario' } }),
      makeItem({ id: 'fe-3', type: 'expense', category: { id: 'cat-exp', name: 'Servicios' } }),
    ]);

    const result = getIncomeCategories(summary);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('cat-income');
  });
});

// ─── getFilteredExpenseItems ──────────────────────────────────────────────────

describe('getFilteredExpenseItems', () => {
  it('returns empty array for null summary', () => {
    expect(getFilteredExpenseItems(null, [])).toHaveLength(0);
  });

  it('returns all expense items when no categories selected', () => {
    const summary = makeSummary([
      makeItem({ id: 'fe-1', type: 'expense', dueDay: 10 }),
      makeItem({ id: 'fe-2', type: 'expense', dueDay: 5 }),
      makeItem({ id: 'fe-3', type: 'income' }),
    ]);

    const result = getFilteredExpenseItems(summary, []);

    expect(result).toHaveLength(2);
  });

  it('filters by selected categories', () => {
    const summary = makeSummary([
      makeItem({ id: 'fe-1', type: 'expense', category: { id: 'cat-1', name: 'A' } }),
      makeItem({ id: 'fe-2', type: 'expense', category: { id: 'cat-2', name: 'B' } }),
    ]);

    const result = getFilteredExpenseItems(summary, ['cat-1']);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('fe-1');
  });

  it('sorts items by dueDay ascending', () => {
    const summary = makeSummary([
      makeItem({ id: 'fe-1', type: 'expense', dueDay: 20 }),
      makeItem({ id: 'fe-2', type: 'expense', dueDay: 5 }),
      makeItem({ id: 'fe-3', type: 'expense', dueDay: 10 }),
    ]);

    const result = getFilteredExpenseItems(summary, []);

    expect(result.map((i) => i.dueDay)).toEqual([5, 10, 20]);
  });

  it('excludes credit card and debt payment items', () => {
    const summary = makeSummary([
      makeItem({ id: 'fe-1', type: 'expense' }),
      makeItem({ id: 'fe-2', type: 'expense', creditCardAccountId: 'cc-1' }),
      makeItem({ id: 'fe-3', type: 'expense', recurringDebtPaymentId: 'rdp-1' }),
    ]);

    const result = getFilteredExpenseItems(summary, []);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('fe-1');
  });
});

// ─── getFilteredIncomeItems ───────────────────────────────────────────────────

describe('getFilteredIncomeItems', () => {
  it('returns empty array for null summary', () => {
    expect(getFilteredIncomeItems(null, [])).toHaveLength(0);
  });

  it('returns all income items when no categories selected', () => {
    const summary = makeSummary([
      makeItem({ id: 'fe-1', type: 'income', dueDay: 1 }),
      makeItem({ id: 'fe-2', type: 'income', dueDay: 15 }),
      makeItem({ id: 'fe-3', type: 'expense' }),
    ]);

    const result = getFilteredIncomeItems(summary, []);

    expect(result).toHaveLength(2);
  });

  it('sorts items by dueDay ascending', () => {
    const summary = makeSummary([
      makeItem({ id: 'fe-1', type: 'income', dueDay: 28 }),
      makeItem({ id: 'fe-2', type: 'income', dueDay: 1 }),
    ]);

    const result = getFilteredIncomeItems(summary, []);

    expect(result.map((i) => i.dueDay)).toEqual([1, 28]);
  });
});

// ─── getCreditCardItems ───────────────────────────────────────────────────────

describe('getCreditCardItems', () => {
  it('returns empty array for null summary', () => {
    expect(getCreditCardItems(null)).toHaveLength(0);
  });

  it('returns only active credit card items sorted by dueDay', () => {
    const summary = makeSummary([
      makeItem({ id: 'fe-1', creditCardAccountId: 'cc-1', isActive: true, dueDay: 20 }),
      makeItem({ id: 'fe-2', creditCardAccountId: 'cc-2', isActive: false, dueDay: 5 }),
      makeItem({ id: 'fe-3', creditCardAccountId: 'cc-3', isActive: true, dueDay: 10 }),
      makeItem({ id: 'fe-4' }),
    ]);

    const result = getCreditCardItems(summary);

    expect(result).toHaveLength(2);
    expect(result.map((i) => i.dueDay)).toEqual([10, 20]);
  });
});

// ─── getDebtPaymentItems ──────────────────────────────────────────────────────

describe('getDebtPaymentItems', () => {
  it('returns empty array for null summary', () => {
    expect(getDebtPaymentItems(null)).toHaveLength(0);
  });

  it('returns only active debt payment items sorted by dueDay', () => {
    const summary = makeSummary([
      makeItem({ id: 'fe-1', recurringDebtPaymentId: 'rdp-1', isActive: true, dueDay: 15 }),
      makeItem({ id: 'fe-2', recurringDebtPaymentId: 'rdp-2', isActive: false, dueDay: 5 }),
      makeItem({ id: 'fe-3' }),
    ]);

    const result = getDebtPaymentItems(summary);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('fe-1');
  });
});

// ─── sumActiveAmounts ─────────────────────────────────────────────────────────

describe('sumActiveAmounts', () => {
  it('sums only active items', () => {
    const items: FixedExpenseWithStatus[] = [
      makeItem({ amount: 500, isActive: true }),
      makeItem({ amount: 300, isActive: false }),
      makeItem({ amount: 200, isActive: true }),
    ];

    expect(sumActiveAmounts(items)).toBe(700);
  });

  it('returns 0 for empty array', () => {
    expect(sumActiveAmounts([])).toBe(0);
  });

  it('returns 0 when all items are inactive', () => {
    const items: FixedExpenseWithStatus[] = [makeItem({ isActive: false })];
    expect(sumActiveAmounts(items)).toBe(0);
  });
});

// ─── toggleCategorySelection ──────────────────────────────────────────────────

describe('toggleCategorySelection', () => {
  it('adds a category id when not present', () => {
    const result = toggleCategorySelection(['cat-1'], 'cat-2');
    expect(result).toEqual(['cat-1', 'cat-2']);
  });

  it('removes a category id when already present', () => {
    const result = toggleCategorySelection(['cat-1', 'cat-2'], 'cat-1');
    expect(result).toEqual(['cat-2']);
  });

  it('adds to empty array', () => {
    expect(toggleCategorySelection([], 'cat-1')).toEqual(['cat-1']);
  });

  it('does not mutate the original array', () => {
    const original = ['cat-1'];
    toggleCategorySelection(original, 'cat-2');
    expect(original).toHaveLength(1);
  });
});
