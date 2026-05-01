import { describe, it, expect } from 'vitest';
import {
  computeTotalToPay,
  countPendingCards,
  computeCurrentPeriodTotal,
  computeTotalUsed,
  getTodayDateString,
} from '../utils';
import type { CreditCardStatement } from '../../../types';

// ---------------------------------------------------------------------------
// Minimal stub builder — only the fields the utils touch
// ---------------------------------------------------------------------------
function makeStatement(
  overrides: {
    closedIsPaid?: boolean;
    closedBalance?: number;
    currentBalance?: number;
  } = {}
): CreditCardStatement {
  const { closedIsPaid = false, closedBalance = 100, currentBalance = 50 } = overrides;

  return {
    account: {
      id: 'acc-1',
      name: 'Visa Gold',
      type: 'credit_card',
      balance: 0,
      currency: 'EUR',
      color: '#7c3aed',
      creditLimit: 5000,
      cutoffDay: 20,
      paymentDueDay: 5,
      createdAt: '2024-01-01',
    },
    currentPeriod: {
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      balance: currentBalance,
      transactions: [],
      daysUntilCutoff: 5,
    },
    closedPeriod: {
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      balance: closedBalance,
      transactions: [],
      isPaid: closedIsPaid,
      paymentDueDate: '2026-04-10',
      daysUntilDue: 9,
    },
    creditLimit: 5000,
    available: 4850,
    usagePercentage: 3,
    alerts: [],
  };
}

// ---------------------------------------------------------------------------
// computeTotalToPay
// ---------------------------------------------------------------------------
describe('computeTotalToPay', () => {
  it('returns 0 for empty list', () => {
    expect(computeTotalToPay([])).toBe(0);
  });

  it('sums unpaid closed balances only', () => {
    const statements = [
      makeStatement({ closedIsPaid: false, closedBalance: 200 }),
      makeStatement({ closedIsPaid: true, closedBalance: 150 }),
      makeStatement({ closedIsPaid: false, closedBalance: 75 }),
    ];
    expect(computeTotalToPay(statements)).toBe(275);
  });

  it('returns 0 when all cards are paid', () => {
    const statements = [
      makeStatement({ closedIsPaid: true, closedBalance: 500 }),
      makeStatement({ closedIsPaid: true, closedBalance: 300 }),
    ];
    expect(computeTotalToPay(statements)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// countPendingCards
// ---------------------------------------------------------------------------
describe('countPendingCards', () => {
  it('returns 0 for empty list', () => {
    expect(countPendingCards([])).toBe(0);
  });

  it('counts only unpaid cards', () => {
    const statements = [
      makeStatement({ closedIsPaid: false }),
      makeStatement({ closedIsPaid: true }),
      makeStatement({ closedIsPaid: false }),
    ];
    expect(countPendingCards(statements)).toBe(2);
  });

  it('returns 0 when all are paid', () => {
    const statements = [makeStatement({ closedIsPaid: true })];
    expect(countPendingCards(statements)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// computeCurrentPeriodTotal
// ---------------------------------------------------------------------------
describe('computeCurrentPeriodTotal', () => {
  it('returns 0 for empty list', () => {
    expect(computeCurrentPeriodTotal([])).toBe(0);
  });

  it('sums all current period balances', () => {
    const statements = [
      makeStatement({ currentBalance: 300 }),
      makeStatement({ currentBalance: 150 }),
    ];
    expect(computeCurrentPeriodTotal(statements)).toBe(450);
  });
});

// ---------------------------------------------------------------------------
// computeTotalUsed
// ---------------------------------------------------------------------------
describe('computeTotalUsed', () => {
  it('returns 0 for empty list', () => {
    expect(computeTotalUsed([])).toBe(0);
  });

  it('adds current + unpaid closed balances', () => {
    const statements = [
      makeStatement({ currentBalance: 100, closedBalance: 200, closedIsPaid: false }),
      makeStatement({ currentBalance: 50, closedBalance: 300, closedIsPaid: true }),
    ];
    // Card 1: 100 + 200 = 300; Card 2: 50 + 0 = 50 (closed is paid)
    expect(computeTotalUsed(statements)).toBe(350);
  });
});

// ---------------------------------------------------------------------------
// getTodayDateString
// ---------------------------------------------------------------------------
describe('getTodayDateString', () => {
  it('returns a string matching YYYY-MM-DD format', () => {
    const result = getTodayDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("matches today's date", () => {
    const today = new Date().toISOString().split('T')[0];
    expect(getTodayDateString()).toBe(today);
  });
});
