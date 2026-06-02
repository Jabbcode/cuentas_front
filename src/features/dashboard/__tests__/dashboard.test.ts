import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type {
  MonthlySummary,
  FixedExpense,
  CreditCardsSummary,
  DebtsSummary,
} from '../../../types';
import {
  getPrevMonth,
  calcDiffPct,
  mergeCategories,
  calcDaysLeftInMonth,
  calcSpentPercentage,
  calcDaysUntilDueDay,
  filterUpcomingFixedExpenses,
  hasAlerts,
  CREDIT_UTILIZATION_ALERT_THRESHOLD,
} from '../utils';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeSummary = (
  month: number,
  year: number,
  categories: MonthlySummary['categories'] = []
): MonthlySummary => ({
  month,
  year,
  totalExpenses: 0,
  totalIncome: 0,
  net: 0,
  categories,
});

const makeCat = (id: string, total: number) => ({
  id,
  name: `Cat ${id}`,
  total,
  percentage: 0,
});

// ─── getPrevMonth ─────────────────────────────────────────────────────────────

describe('getPrevMonth', () => {
  it('returns previous month in the same year', () => {
    expect(getPrevMonth(6, 2024)).toEqual({ month: 5, year: 2024 });
  });

  it('wraps January to December of the previous year', () => {
    expect(getPrevMonth(1, 2024)).toEqual({ month: 12, year: 2023 });
  });

  it('handles December correctly', () => {
    expect(getPrevMonth(12, 2024)).toEqual({ month: 11, year: 2024 });
  });
});

// ─── calcDiffPct ──────────────────────────────────────────────────────────────

describe('calcDiffPct', () => {
  it('returns null when previous is 0', () => {
    expect(calcDiffPct(100, 0)).toBeNull();
  });

  it('returns 0 when current equals previous', () => {
    expect(calcDiffPct(100, 100)).toBe(0);
  });

  it('returns positive percentage when current is higher', () => {
    expect(calcDiffPct(150, 100)).toBe(50);
  });

  it('returns negative percentage when current is lower', () => {
    expect(calcDiffPct(50, 100)).toBe(-50);
  });

  it('rounds to nearest integer', () => {
    expect(calcDiffPct(133, 100)).toBe(33);
  });
});

// ─── mergeCategories ──────────────────────────────────────────────────────────

describe('mergeCategories', () => {
  it('includes categories only in current with previous=0 and trend=up', () => {
    const current = makeSummary(5, 2024, [makeCat('cat-1', 300)]);
    const previous = makeSummary(4, 2024, []);

    const result = mergeCategories(current, previous);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'cat-1', current: 300, previous: 0, trend: 'up' });
  });

  it('includes categories only in previous with current=0, diff=-total and trend=down', () => {
    const current = makeSummary(5, 2024, []);
    const previous = makeSummary(4, 2024, [makeCat('cat-1', 200)]);

    const result = mergeCategories(current, previous);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'cat-1',
      current: 0,
      previous: 200,
      diff: -200,
      diffPercentage: -100,
      trend: 'down',
    });
  });

  it('merges a category present in both months', () => {
    const current = makeSummary(5, 2024, [makeCat('cat-1', 300)]);
    const previous = makeSummary(4, 2024, [makeCat('cat-1', 200)]);

    const result = mergeCategories(current, previous);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'cat-1',
      current: 300,
      previous: 200,
      diff: 100,
      diffPercentage: 50,
      trend: 'up',
    });
  });

  it('sets trend=down when current < previous', () => {
    const current = makeSummary(5, 2024, [makeCat('cat-1', 100)]);
    const previous = makeSummary(4, 2024, [makeCat('cat-1', 200)]);

    const [entry] = mergeCategories(current, previous);
    expect(entry.trend).toBe('down');
  });

  it('sets trend=same when current equals previous', () => {
    const current = makeSummary(5, 2024, [makeCat('cat-1', 200)]);
    const previous = makeSummary(4, 2024, [makeCat('cat-1', 200)]);

    const [entry] = mergeCategories(current, previous);
    expect(entry.trend).toBe('same');
  });

  it('sorts results by current amount descending', () => {
    const current = makeSummary(5, 2024, [makeCat('cat-a', 100), makeCat('cat-b', 500)]);
    const previous = makeSummary(4, 2024, []);

    const result = mergeCategories(current, previous);

    expect(result.map((r) => r.id)).toEqual(['cat-b', 'cat-a']);
  });

  it('returns empty array for two empty summaries', () => {
    expect(mergeCategories(makeSummary(5, 2024), makeSummary(4, 2024))).toHaveLength(0);
  });
});

// ─── calcDaysLeftInMonth ──────────────────────────────────────────────────────

describe('calcDaysLeftInMonth', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a positive number on a normal day of the month', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 4, 15)); // May 15 → 16 days left
    expect(calcDaysLeftInMonth()).toBe(16);
  });

  it('returns 0 on the last day of the month', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 4, 31)); // May 31 → 0 days left
    expect(calcDaysLeftInMonth()).toBe(0);
  });
});

// ─── calcSpentPercentage ──────────────────────────────────────────────────────

describe('calcSpentPercentage', () => {
  it('returns correct percentage in normal case', () => {
    expect(calcSpentPercentage(500, 1000)).toBe(50);
  });

  it('returns 0 when income is 0 (no division by zero)', () => {
    expect(calcSpentPercentage(500, 0)).toBe(0);
  });

  it('returns more than 100 when expenses exceed income', () => {
    expect(calcSpentPercentage(1200, 1000)).toBeGreaterThan(100);
  });
});

// ─── calcDaysUntilDueDay ──────────────────────────────────────────────────────

describe('calcDaysUntilDueDay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 4, 15)); // May 15
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns dueDay - today when dueDay > today', () => {
    expect(calcDaysUntilDueDay(20)).toBe(5);
  });

  it('returns wrap-around when dueDay < today', () => {
    // hoy=15, dueDay=2, daysInMonth=31 → (31-15)+2 = 18
    expect(calcDaysUntilDueDay(2)).toBe(18);
  });

  it('returns 0 when dueDay equals today', () => {
    expect(calcDaysUntilDueDay(15)).toBe(0);
  });

  it('returns Infinity for invalid dueDay 0', () => {
    expect(calcDaysUntilDueDay(0)).toBe(Infinity);
  });

  it('returns Infinity for invalid dueDay 32', () => {
    expect(calcDaysUntilDueDay(32)).toBe(Infinity);
  });
});

// ─── filterUpcomingFixedExpenses ──────────────────────────────────────────────

describe('filterUpcomingFixedExpenses', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 4, 15)); // May 15
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const makeItem = (
    dueDay: number,
    isPaidThisMonth: boolean
  ): FixedExpense & { isPaidThisMonth: boolean } => ({
    id: `item-${dueDay}`,
    name: `Expense ${dueDay}`,
    amount: 100,
    type: 'expense',
    dueDay,
    isActive: true,
    autoGenerate: false,
    accountId: 'acc-1',
    categoryId: 'cat-1',
    isPaidThisMonth,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  });

  it('does not include items with isPaidThisMonth === true', () => {
    const result = filterUpcomingFixedExpenses([makeItem(17, true)], 7);
    expect(result).toHaveLength(0);
  });

  it('includes unpaid items within the window', () => {
    // dueDay=18 → 3 days from today=15, window=7
    const result = filterUpcomingFixedExpenses([makeItem(18, false)], 7);
    expect(result).toHaveLength(1);
  });

  it('does not include unpaid items outside the window', () => {
    // dueDay=25 → 10 days from today=15, window=7
    const result = filterUpcomingFixedExpenses([makeItem(25, false)], 7);
    expect(result).toHaveLength(0);
  });
});

// ─── hasAlerts ────────────────────────────────────────────────────────────────

describe('hasAlerts', () => {
  it('returns false when all params are null', () => {
    expect(hasAlerts(null, null, null)).toBe(false);
  });

  it('returns true when there are overdue debts', () => {
    const debts: DebtsSummary = {
      totalActiveDebts: 1,
      totalOverdueDebts: 1,
      totalDebtAmount: 500,
      totalOverdueAmount: 500,
      debtsDueSoon: 0,
      upcomingDebts: [],
    };
    expect(hasAlerts(debts, null, null)).toBe(true);
  });

  it('returns true when a card has usagePercentage > threshold', () => {
    const ccSummary = {
      totalToPay: 0,
      upcomingPayments: [],
      alerts: [],
      cards: [
        {
          usagePercentage: CREDIT_UTILIZATION_ALERT_THRESHOLD + 0.01,
        },
      ],
    } as unknown as CreditCardsSummary;
    expect(hasAlerts(null, ccSummary, null)).toBe(true);
  });
});
