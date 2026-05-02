import { describe, it, expect } from 'vitest';
import {
  groupTransactionsByCategory,
  calculatePaginationInfo,
  buildTransactionApiFilters,
  applyClientSideFilters,
  hasActiveFilters,
  DEFAULT_FILTER_STATE,
} from '../utils';
import type { Transaction } from '../../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'tx-1',
    amount: 100,
    type: 'expense',
    date: '2024-01-15T12:00:00.000Z',
    accountId: 'acc-1',
    categoryId: 'cat-1',
    createdAt: '2024-01-15T12:00:00.000Z',
    updatedAt: '2024-01-15T12:00:00.000Z',
    category: { id: 'cat-1', name: 'Food', icon: null, color: null },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// groupTransactionsByCategory
// ---------------------------------------------------------------------------

describe('groupTransactionsByCategory', () => {
  it('returns empty array for empty input', () => {
    expect(groupTransactionsByCategory([])).toEqual([]);
  });

  it('groups transactions by category id', () => {
    const txs = [
      makeTransaction({
        id: 'tx-1',
        amount: 50,
        type: 'expense',
        category: { id: 'cat-1', name: 'Food', icon: null, color: null },
      }),
      makeTransaction({
        id: 'tx-2',
        amount: 30,
        type: 'expense',
        category: { id: 'cat-1', name: 'Food', icon: null, color: null },
      }),
      makeTransaction({
        id: 'tx-3',
        amount: 20,
        type: 'expense',
        category: { id: 'cat-2', name: 'Transport', icon: null, color: null },
      }),
    ];
    const result = groupTransactionsByCategory(txs);
    expect(result).toHaveLength(2);
    const foodGroup = result.find((g) => g.category.id === 'cat-1')!;
    expect(foodGroup.transactions).toHaveLength(2);
    expect(foodGroup.total).toBe(-80); // expenses are negative
  });

  it('signs income as positive, expense as negative', () => {
    const txs = [
      makeTransaction({
        id: 'tx-1',
        amount: 100,
        type: 'income',
        category: { id: 'cat-1', name: 'Salary', icon: null, color: null },
      }),
    ];
    const [group] = groupTransactionsByCategory(txs);
    expect(group.total).toBe(100);
  });

  it('skips transactions without a category', () => {
    const txs = [makeTransaction({ id: 'tx-1', category: undefined })];
    expect(groupTransactionsByCategory(txs)).toHaveLength(0);
  });

  it('sorts groups by absolute total descending', () => {
    const txs = [
      makeTransaction({
        id: 'tx-1',
        amount: 10,
        type: 'expense',
        category: { id: 'cat-1', name: 'A', icon: null, color: null },
      }),
      makeTransaction({
        id: 'tx-2',
        amount: 100,
        type: 'expense',
        category: { id: 'cat-2', name: 'B', icon: null, color: null },
      }),
    ];
    const [first] = groupTransactionsByCategory(txs);
    expect(first.category.id).toBe('cat-2');
  });
});

// ---------------------------------------------------------------------------
// calculatePaginationInfo
// ---------------------------------------------------------------------------

describe('calculatePaginationInfo', () => {
  it('returns zeros when total is 0', () => {
    const info = calculatePaginationInfo(1, 0, 20);
    expect(info.startItem).toBe(0);
    expect(info.endItem).toBe(0);
    expect(info.totalPages).toBe(0);
    expect(info.hasNextPage).toBe(false);
    expect(info.hasPreviousPage).toBe(false);
  });

  it('computes first page correctly', () => {
    const info = calculatePaginationInfo(1, 50, 20);
    expect(info.startItem).toBe(1);
    expect(info.endItem).toBe(20);
    expect(info.totalPages).toBe(3);
    expect(info.hasNextPage).toBe(true);
    expect(info.hasPreviousPage).toBe(false);
  });

  it('computes last page correctly', () => {
    const info = calculatePaginationInfo(3, 50, 20);
    expect(info.startItem).toBe(41);
    expect(info.endItem).toBe(50);
    expect(info.hasNextPage).toBe(false);
    expect(info.hasPreviousPage).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// buildTransactionApiFilters
// ---------------------------------------------------------------------------

describe('buildTransactionApiFilters', () => {
  it('always includes limit and offset', () => {
    const filters = buildTransactionApiFilters({ currentPage: 2, itemsPerPage: 10 });
    expect(filters.limit).toBe(10);
    expect(filters.offset).toBe(10);
  });

  it('excludes type when "all"', () => {
    const filters = buildTransactionApiFilters({ currentPage: 1, itemsPerPage: 20, type: 'all' });
    expect(filters.type).toBeUndefined();
  });

  it('includes type when "expense" or "income"', () => {
    const filters = buildTransactionApiFilters({
      currentPage: 1,
      itemsPerPage: 20,
      type: 'expense',
    });
    expect(filters.type).toBe('expense');
  });

  it('excludes accountId when "all"', () => {
    const filters = buildTransactionApiFilters({
      currentPage: 1,
      itemsPerPage: 20,
      accountId: 'all',
    });
    expect(filters.accountId).toBeUndefined();
  });

  it('adds endDate as today when startDate set but no endDate', () => {
    const filters = buildTransactionApiFilters({
      currentPage: 1,
      itemsPerPage: 20,
      startDate: '2024-01-01',
    });
    expect(filters.startDate).toBeDefined();
    expect(filters.endDate).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// applyClientSideFilters
// ---------------------------------------------------------------------------

describe('applyClientSideFilters', () => {
  const txs = [
    makeTransaction({
      id: 'tx-1',
      amount: 10,
      category: { id: 'cat-1', name: 'Food', icon: null, color: null },
    }),
    makeTransaction({
      id: 'tx-2',
      amount: 50,
      category: { id: 'cat-2', name: 'Transport', icon: null, color: null },
    }),
    makeTransaction({
      id: 'tx-3',
      amount: 200,
      category: { id: 'cat-1', name: 'Food', icon: null, color: null },
    }),
  ];

  it('returns all transactions when no filters active', () => {
    const result = applyClientSideFilters(txs, { categoryIds: [], minAmount: '', maxAmount: '' });
    expect(result).toHaveLength(3);
  });

  it('filters by category ids', () => {
    const result = applyClientSideFilters(txs, {
      categoryIds: ['cat-1'],
      minAmount: '',
      maxAmount: '',
    });
    expect(result).toHaveLength(2);
    expect(result.every((tx) => tx.category?.id === 'cat-1')).toBe(true);
  });

  it('filters by min amount', () => {
    const result = applyClientSideFilters(txs, { categoryIds: [], minAmount: '50', maxAmount: '' });
    expect(result).toHaveLength(2);
  });

  it('filters by max amount', () => {
    const result = applyClientSideFilters(txs, { categoryIds: [], minAmount: '', maxAmount: '50' });
    expect(result).toHaveLength(2);
  });

  it('combines category and amount filters', () => {
    const result = applyClientSideFilters(txs, {
      categoryIds: ['cat-1'],
      minAmount: '50',
      maxAmount: '',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('tx-3');
  });
});

// ---------------------------------------------------------------------------
// hasActiveFilters
// ---------------------------------------------------------------------------

describe('hasActiveFilters', () => {
  it('returns false for default state', () => {
    expect(hasActiveFilters(DEFAULT_FILTER_STATE)).toBe(false);
  });

  it('returns true when startDate is set', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTER_STATE, startDate: '2024-01-01' })).toBe(true);
  });

  it('returns true when categoryIds is non-empty', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTER_STATE, categoryIds: ['cat-1'] })).toBe(true);
  });

  it('returns true when type is not "all"', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTER_STATE, type: 'expense' })).toBe(true);
  });

  it('returns true when tag is set', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTER_STATE, tag: 'comida' })).toBe(true);
  });
});
