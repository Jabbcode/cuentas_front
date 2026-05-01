import { describe, it, expect } from 'vitest';
import type { Debt, RecurringDebtPayment } from '../../../types';
import {
  groupDebtsByStatus,
  calculateDebtTotals,
  getStatusBadgeClasses,
  getStatusText,
  calcProgressPercentage,
  calcInterest,
  filterRecurringByDebt,
  getScheduleText,
  suggestMonthlyAmount,
  calcPeriodsToPayOff,
} from '../utils';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeDebt = (overrides: Partial<Debt> = {}): Debt => ({
  id: 'debt-1',
  userId: 'user-1',
  creditor: 'Banco Nacional',
  description: 'Préstamo personal',
  totalAmount: 10000,
  remainingAmount: 5000,
  status: 'active',
  startDate: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const makeRecurringPayment = (
  overrides: Partial<RecurringDebtPayment> = {}
): RecurringDebtPayment => ({
  id: 'rp-1',
  debtId: 'debt-1',
  accountId: 'acc-1',
  amount: 500,
  frequency: 'monthly',
  dayOfMonth: 15,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

// ─── groupDebtsByStatus ───────────────────────────────────────────────────────

describe('groupDebtsByStatus', () => {
  it('splits debts into correct groups', () => {
    const debts: Debt[] = [
      makeDebt({ id: 'd1', status: 'active' }),
      makeDebt({ id: 'd2', status: 'overdue' }),
      makeDebt({ id: 'd3', status: 'paid' }),
      makeDebt({ id: 'd4', status: 'active' }),
    ];

    const result = groupDebtsByStatus(debts);

    expect(result.activeDebts).toHaveLength(2);
    expect(result.overdueDebts).toHaveLength(1);
    expect(result.paidDebts).toHaveLength(1);
  });

  it('returns empty groups for empty input', () => {
    const result = groupDebtsByStatus([]);
    expect(result.activeDebts).toHaveLength(0);
    expect(result.overdueDebts).toHaveLength(0);
    expect(result.paidDebts).toHaveLength(0);
  });

  it('handles all debts in a single status', () => {
    const debts = [makeDebt({ id: 'd1', status: 'paid' }), makeDebt({ id: 'd2', status: 'paid' })];

    const result = groupDebtsByStatus(debts);

    expect(result.paidDebts).toHaveLength(2);
    expect(result.activeDebts).toHaveLength(0);
    expect(result.overdueDebts).toHaveLength(0);
  });
});

// ─── calculateDebtTotals ──────────────────────────────────────────────────────

describe('calculateDebtTotals', () => {
  it('sums remaining amounts for active and overdue groups', () => {
    const groups = {
      activeDebts: [makeDebt({ remainingAmount: 3000 }), makeDebt({ remainingAmount: 2000 })],
      overdueDebts: [makeDebt({ remainingAmount: 1500 })],
      paidDebts: [makeDebt({ remainingAmount: 0 })],
    };

    const result = calculateDebtTotals(groups);

    expect(result.totalActiveDebt).toBe(5000);
    expect(result.totalOverdueDebt).toBe(1500);
  });

  it('returns zero totals for empty groups', () => {
    const groups = { activeDebts: [], overdueDebts: [], paidDebts: [] };
    const result = calculateDebtTotals(groups);
    expect(result.totalActiveDebt).toBe(0);
    expect(result.totalOverdueDebt).toBe(0);
  });

  it('ignores paid debts in totals', () => {
    const groups = {
      activeDebts: [],
      overdueDebts: [],
      paidDebts: [makeDebt({ remainingAmount: 9999 })],
    };
    const result = calculateDebtTotals(groups);
    expect(result.totalActiveDebt).toBe(0);
    expect(result.totalOverdueDebt).toBe(0);
  });
});

// ─── getStatusBadgeClasses ────────────────────────────────────────────────────

describe('getStatusBadgeClasses', () => {
  it('returns green classes for paid', () => {
    expect(getStatusBadgeClasses('paid')).toContain('green');
  });

  it('returns red classes for overdue', () => {
    expect(getStatusBadgeClasses('overdue')).toContain('red');
  });

  it('returns blue classes for active', () => {
    expect(getStatusBadgeClasses('active')).toContain('blue');
  });
});

// ─── getStatusText ────────────────────────────────────────────────────────────

describe('getStatusText', () => {
  it('returns "Pagada" for paid', () => {
    expect(getStatusText('paid')).toBe('Pagada');
  });

  it('returns "Vencida" for overdue', () => {
    expect(getStatusText('overdue')).toBe('Vencida');
  });

  it('returns "Activa" for active', () => {
    expect(getStatusText('active')).toBe('Activa');
  });
});

// ─── calcProgressPercentage ───────────────────────────────────────────────────

describe('calcProgressPercentage', () => {
  it('returns 0 when totalAmount is 0', () => {
    expect(calcProgressPercentage(0, 0)).toBe(0);
  });

  it('returns 50 when half is paid', () => {
    expect(calcProgressPercentage(10000, 5000)).toBe(50);
  });

  it('returns 100 when fully paid (remaining is 0)', () => {
    expect(calcProgressPercentage(10000, 0)).toBe(100);
  });

  it('returns 0 when nothing is paid (remaining equals total)', () => {
    expect(calcProgressPercentage(10000, 10000)).toBe(0);
  });
});

// ─── calcInterest ─────────────────────────────────────────────────────────────

describe('calcInterest', () => {
  it('returns 0 when no interestRate provided', () => {
    expect(calcInterest(5000)).toBe(0);
  });

  it('returns 0 when interestType is not provided', () => {
    expect(calcInterest(5000, 10)).toBe(0);
  });

  it('calculates percentage interest correctly', () => {
    expect(calcInterest(5000, 10, 'percentage')).toBe(500);
  });

  it('returns fixed interest as-is regardless of remaining', () => {
    expect(calcInterest(5000, 200, 'fixed')).toBe(200);
    expect(calcInterest(1000, 200, 'fixed')).toBe(200);
  });
});

// ─── filterRecurringByDebt ────────────────────────────────────────────────────

describe('filterRecurringByDebt', () => {
  it('returns only payments for the given debtId', () => {
    const payments = [
      makeRecurringPayment({ id: 'rp-1', debtId: 'debt-1' }),
      makeRecurringPayment({ id: 'rp-2', debtId: 'debt-2' }),
      makeRecurringPayment({ id: 'rp-3', debtId: 'debt-1' }),
    ];

    const result = filterRecurringByDebt(payments, 'debt-1');

    expect(result).toHaveLength(2);
    expect(result.every((rp) => rp.debtId === 'debt-1')).toBe(true);
  });

  it('returns empty array when no payments match', () => {
    const payments = [makeRecurringPayment({ debtId: 'debt-2' })];
    expect(filterRecurringByDebt(payments, 'debt-1')).toHaveLength(0);
  });

  it('returns empty array for empty input', () => {
    expect(filterRecurringByDebt([], 'debt-1')).toHaveLength(0);
  });
});

// ─── getScheduleText ──────────────────────────────────────────────────────────

describe('getScheduleText', () => {
  it('returns monthly description with day', () => {
    const payment = makeRecurringPayment({ frequency: 'monthly', dayOfMonth: 15 });
    expect(getScheduleText(payment)).toBe('Día 15 de cada mes');
  });

  it('returns weekly description with day name', () => {
    const payment = makeRecurringPayment({ frequency: 'weekly', dayOfWeek: 1 });
    expect(getScheduleText(payment)).toBe('Cada Lun');
  });

  it('returns biweekly description for biweekly frequency', () => {
    const payment = makeRecurringPayment({ frequency: 'biweekly' });
    expect(getScheduleText(payment)).toBe('Cada 14 días');
  });

  it('defaults to Sunday (index 0) when dayOfWeek is undefined', () => {
    const payment = makeRecurringPayment({ frequency: 'weekly', dayOfWeek: undefined });
    expect(getScheduleText(payment)).toBe('Cada Dom');
  });
});

// ─── suggestMonthlyAmount ─────────────────────────────────────────────────────

describe('suggestMonthlyAmount', () => {
  it('divides remaining amount by 12', () => {
    expect(suggestMonthlyAmount(12000)).toBe(1000);
  });

  it('returns 0 for 0 remaining', () => {
    expect(suggestMonthlyAmount(0)).toBe(0);
  });
});

// ─── calcPeriodsToPayOff ──────────────────────────────────────────────────────

describe('calcPeriodsToPayOff', () => {
  it('returns 0 when paymentAmount is 0', () => {
    expect(calcPeriodsToPayOff(5000, 0)).toBe(0);
  });

  it('returns correct number of periods (rounded up)', () => {
    expect(calcPeriodsToPayOff(1000, 300)).toBe(4);
  });

  it('returns 1 when payment covers the full amount', () => {
    expect(calcPeriodsToPayOff(1000, 1000)).toBe(1);
  });

  it('returns 1 when payment exceeds remaining amount', () => {
    expect(calcPeriodsToPayOff(500, 1000)).toBe(1);
  });
});
