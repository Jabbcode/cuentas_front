/**
 * Tests for accounts utility functions.
 *
 * Setup (one-time):
 *   npm install -D vitest @vitest/ui
 *   Add to vite.config.ts:  test: { environment: 'jsdom', globals: true }
 *   Add to package.json scripts:  "test": "vitest run"
 */

import { describe, it, expect } from 'vitest';
import type { Account, CreditCardStatement } from '../../../types';
import { groupAccountsByType, calculateBalanceTotals } from '../utils';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeBankAccount = (overrides: Partial<Account> = {}): Account => ({
  id: 'bank-1',
  name: 'BBVA',
  type: 'bank',
  balance: 1000,
  currency: 'EUR',
  createdAt: '2024-01-01',
  ...overrides,
});

const makeCashAccount = (overrides: Partial<Account> = {}): Account => ({
  id: 'cash-1',
  name: 'Cartera',
  type: 'cash',
  balance: 200,
  currency: 'EUR',
  createdAt: '2024-01-01',
  ...overrides,
});

const makeCreditCard = (overrides: Partial<Account> = {}): Account => ({
  id: 'cc-1',
  name: 'Visa',
  type: 'credit_card',
  balance: -300,
  currency: 'EUR',
  creditLimit: 5000,
  createdAt: '2024-01-01',
  ...overrides,
});

const makeStatement = (
  accountId: string,
  overrides: Partial<CreditCardStatement> = {}
): CreditCardStatement => ({
  account: makeCreditCard({ id: accountId }),
  creditLimit: 5000,
  available: 4500,
  usagePercentage: 10,
  currentPeriod: {
    balance: 500,
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    daysUntilCutoff: 5,
    transactions: [],
  },
  closedPeriod: {
    balance: 0,
    isPaid: true,
    startDate: '2023-12-01',
    endDate: '2023-12-15',
    paymentDueDate: '2023-12-30',
    daysUntilDue: 0,
    transactions: [],
  },
  alerts: [],
  ...overrides,
});

// ─── groupAccountsByType ───────────────────────────────────────────────────────

describe('groupAccountsByType', () => {
  it('groups accounts by their type correctly', () => {
    const accounts: Account[] = [
      makeBankAccount({ id: 'b1' }),
      makeBankAccount({ id: 'b2' }),
      makeCashAccount(),
      makeCreditCard(),
    ];

    const result = groupAccountsByType(accounts);

    expect(result.bank).toHaveLength(2);
    expect(result.cash).toHaveLength(1);
    expect(result.credit_card).toHaveLength(1);
  });

  it('returns empty object for empty account list', () => {
    const result = groupAccountsByType([]);
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('handles single account of one type', () => {
    const result = groupAccountsByType([makeBankAccount()]);
    expect(result.bank).toHaveLength(1);
    expect(result.cash).toBeUndefined();
    expect(result.credit_card).toBeUndefined();
  });

  it('preserves account data integrity after grouping', () => {
    const account = makeBankAccount({ name: 'Santander', balance: 9999 });
    const result = groupAccountsByType([account]);
    expect(result.bank[0]).toEqual(account);
  });
});

// ─── calculateBalanceTotals ───────────────────────────────────────────────────

describe('calculateBalanceTotals', () => {
  it('sums non-credit-card balances directly', () => {
    const accounts: Account[] = [
      makeBankAccount({ balance: 1000 }),
      makeCashAccount({ balance: 200 }),
    ];

    const { totalBalance, unpaidClosedTotal } = calculateBalanceTotals(accounts, {});

    expect(totalBalance).toBe(1200);
    expect(unpaidClosedTotal).toBe(0);
  });

  it('uses creditLimit - currentPeriod.balance when statement exists', () => {
    const cc = makeCreditCard({ id: 'cc-1', creditLimit: 5000 });
    const stmt = makeStatement('cc-1', {
      creditLimit: 5000,
      currentPeriod: {
        balance: 500,
        startDate: '2024-01-01',
        endDate: '2024-01-15',
        daysUntilCutoff: 5,
        transactions: [],
      },
    });

    const { totalBalance } = calculateBalanceTotals([cc], { 'cc-1': stmt });

    // 5000 - 500 = 4500
    expect(totalBalance).toBe(4500);
  });

  it('subtracts unpaid closed period balance and accumulates unpaid total', () => {
    const cc = makeCreditCard({ id: 'cc-1', creditLimit: 5000 });
    const stmt = makeStatement('cc-1', {
      creditLimit: 5000,
      currentPeriod: {
        balance: 500,
        startDate: '2024-01-01',
        endDate: '2024-01-15',
        daysUntilCutoff: 5,
        transactions: [],
      },
      closedPeriod: {
        balance: 300,
        isPaid: false,
        startDate: '2023-12-01',
        endDate: '2023-12-15',
        paymentDueDate: '2023-12-30',
        daysUntilDue: 0,
        transactions: [],
      },
    });

    const { totalBalance, unpaidClosedTotal } = calculateBalanceTotals([cc], { 'cc-1': stmt });

    // (5000 - 500) - 300 = 4200
    expect(totalBalance).toBe(4200);
    expect(unpaidClosedTotal).toBe(300);
  });

  it('falls back to creditLimit - |balance| when no statement available', () => {
    const cc = makeCreditCard({ id: 'cc-1', creditLimit: 5000, balance: -300 });

    const { totalBalance } = calculateBalanceTotals([cc], {});

    // 5000 - 300 = 4700
    expect(totalBalance).toBe(4700);
  });

  it('skips credit-card fallback if creditLimit is not set', () => {
    const cc: Account = {
      ...makeCreditCard(),
      creditLimit: undefined,
      balance: -300,
    };

    const { totalBalance } = calculateBalanceTotals([cc], {});

    // Treated as normal balance: -300
    expect(totalBalance).toBe(-300);
  });

  it('returns zero totals for empty account list', () => {
    const { totalBalance, unpaidClosedTotal } = calculateBalanceTotals([], {});
    expect(totalBalance).toBe(0);
    expect(unpaidClosedTotal).toBe(0);
  });

  it('does not accumulate unpaid when closedPeriod.balance is 0', () => {
    const cc = makeCreditCard({ id: 'cc-1', creditLimit: 5000 });
    const stmt = makeStatement('cc-1', {
      closedPeriod: {
        balance: 0,
        isPaid: false,
        startDate: '2023-12-01',
        endDate: '2023-12-15',
        paymentDueDate: '2023-12-30',
        daysUntilDue: 0,
        transactions: [],
      },
    });

    const { unpaidClosedTotal } = calculateBalanceTotals([cc], { 'cc-1': stmt });

    expect(unpaidClosedTotal).toBe(0);
  });

  it('does not accumulate unpaid when closedPeriod.isPaid is true', () => {
    const cc = makeCreditCard({ id: 'cc-1', creditLimit: 5000 });
    const stmt = makeStatement('cc-1', {
      closedPeriod: {
        balance: 500,
        isPaid: true,
        startDate: '2023-12-01',
        endDate: '2023-12-15',
        paymentDueDate: '2023-12-30',
        daysUntilDue: 0,
        transactions: [],
      },
    });

    const { unpaidClosedTotal } = calculateBalanceTotals([cc], { 'cc-1': stmt });

    expect(unpaidClosedTotal).toBe(0);
  });

  it('aggregates mixed account types correctly', () => {
    const bank = makeBankAccount({ balance: 2000 });
    const cash = makeCashAccount({ balance: 500 });
    const cc = makeCreditCard({ id: 'cc-1', creditLimit: 10000 });
    const stmt = makeStatement('cc-1', {
      creditLimit: 10000,
      currentPeriod: {
        balance: 1000,
        startDate: '2024-01-01',
        endDate: '2024-01-15',
        daysUntilCutoff: 5,
        transactions: [],
      },
      closedPeriod: {
        balance: 200,
        isPaid: false,
        startDate: '2023-12-01',
        endDate: '2023-12-15',
        paymentDueDate: '2023-12-30',
        daysUntilDue: 0,
        transactions: [],
      },
    });

    const { totalBalance, unpaidClosedTotal } = calculateBalanceTotals([bank, cash, cc], {
      'cc-1': stmt,
    });

    // bank: 2000, cash: 500, cc: (10000 - 1000) - 200 = 8800
    expect(totalBalance).toBe(2000 + 500 + 8800);
    expect(unpaidClosedTotal).toBe(200);
  });
});
