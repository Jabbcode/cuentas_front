import { describe, it, expect } from 'vitest';
import type { Account, CreditCardStatement } from '../../../types';
import type { AccountFormData } from '../types';
import { groupAccountsByType, buildAccountPayload, calculateBalanceTotals } from '../utils';

// ─── Fixtures ────────────────────────────────────────────────────────────────

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

const makeFormData = (overrides: Partial<AccountFormData> = {}): AccountFormData => ({
  name: 'Mi Cuenta',
  type: 'bank',
  balance: '1000',
  currency: 'EUR',
  color: '#3B82F6',
  creditLimit: '',
  cutoffDay: '',
  paymentDueDay: '',
  paymentAccountId: '',
  ...overrides,
});

// ─── groupAccountsByType ──────────────────────────────────────────────────────

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

  it('handles single account type', () => {
    const result = groupAccountsByType([makeBankAccount()]);
    expect(result.bank).toHaveLength(1);
    expect(result.cash).toBeUndefined();
    expect(result.credit_card).toBeUndefined();
  });

  it('preserves account data after grouping', () => {
    const account = makeBankAccount({ name: 'Santander', balance: 9999 });
    const result = groupAccountsByType([account]);
    expect(result.bank[0]).toEqual(account);
  });
});

// ─── buildAccountPayload ──────────────────────────────────────────────────────

describe('buildAccountPayload', () => {
  it('parses balance string to float', () => {
    const result = buildAccountPayload(makeFormData({ balance: '1500.50' }));
    expect(result.balance).toBe(1500.5);
  });

  it('includes base fields for non-credit-card accounts', () => {
    const result = buildAccountPayload(makeFormData({ type: 'bank' }));
    expect(result.name).toBe('Mi Cuenta');
    expect(result.type).toBe('bank');
    expect(result.currency).toBe('EUR');
    expect(result.color).toBe('#3B82F6');
    expect(result.creditLimit).toBeUndefined();
    expect(result.cutoffDay).toBeUndefined();
    expect(result.paymentDueDay).toBeUndefined();
  });

  it('includes credit card fields when type is credit_card', () => {
    const result = buildAccountPayload(
      makeFormData({
        type: 'credit_card',
        creditLimit: '5000',
        cutoffDay: '15',
        paymentDueDay: '5',
        paymentAccountId: 'acc-123',
      })
    );

    expect(result.creditLimit).toBe(5000);
    expect(result.cutoffDay).toBe(15);
    expect(result.paymentDueDay).toBe(5);
    expect(result.paymentAccountId).toBe('acc-123');
  });

  it('omits credit card fields when they are empty strings', () => {
    const result = buildAccountPayload(
      makeFormData({
        type: 'credit_card',
        creditLimit: '',
        cutoffDay: '',
        paymentDueDay: '',
        paymentAccountId: '',
      })
    );

    expect(result.creditLimit).toBeUndefined();
    expect(result.cutoffDay).toBeUndefined();
    expect(result.paymentDueDay).toBeUndefined();
    expect(result.paymentAccountId).toBeUndefined();
  });

  it('does not include credit card fields for cash accounts', () => {
    const result = buildAccountPayload(
      makeFormData({ type: 'cash', creditLimit: '999', cutoffDay: '10' })
    );
    expect(result.creditLimit).toBeUndefined();
    expect(result.cutoffDay).toBeUndefined();
  });
});

// ─── calculateBalanceTotals ───────────────────────────────────────────────────

describe('calculateBalanceTotals', () => {
  it('sums non-credit-card balances directly', () => {
    const accounts = [makeBankAccount({ balance: 1000 }), makeCashAccount({ balance: 200 })];
    const { totalBalance, unpaidClosedTotal } = calculateBalanceTotals(accounts, {});
    expect(totalBalance).toBe(1200);
    expect(unpaidClosedTotal).toBe(0);
  });

  it('uses creditLimit minus currentPeriod balance when statement exists', () => {
    const cc = makeCreditCard({ id: 'cc-1', creditLimit: 5000 });
    const stmt = makeStatement('cc-1', {
      creditLimit: 5000,
      currentPeriod: {
        balance: 500,
        startDate: '',
        endDate: '',
        daysUntilCutoff: 0,
        transactions: [],
      },
    });

    const { totalBalance } = calculateBalanceTotals([cc], { 'cc-1': stmt });
    expect(totalBalance).toBe(4500);
  });

  it('subtracts unpaid closed period and accumulates unpaidClosedTotal', () => {
    const cc = makeCreditCard({ id: 'cc-1', creditLimit: 5000 });
    const stmt = makeStatement('cc-1', {
      creditLimit: 5000,
      currentPeriod: {
        balance: 500,
        startDate: '',
        endDate: '',
        daysUntilCutoff: 0,
        transactions: [],
      },
      closedPeriod: {
        balance: 300,
        isPaid: false,
        startDate: '',
        endDate: '',
        paymentDueDate: '',
        daysUntilDue: 0,
        transactions: [],
      },
    });

    const { totalBalance, unpaidClosedTotal } = calculateBalanceTotals([cc], { 'cc-1': stmt });
    expect(totalBalance).toBe(4200);
    expect(unpaidClosedTotal).toBe(300);
  });

  it('falls back to creditLimit minus absolute balance when no statement', () => {
    const cc = makeCreditCard({ id: 'cc-1', creditLimit: 5000, balance: -300 });
    const { totalBalance } = calculateBalanceTotals([cc], {});
    expect(totalBalance).toBe(4700);
  });

  it('treats credit card without creditLimit as normal balance', () => {
    const cc: Account = { ...makeCreditCard(), creditLimit: undefined, balance: -300 };
    const { totalBalance } = calculateBalanceTotals([cc], {});
    expect(totalBalance).toBe(-300);
  });

  it('returns zero totals for empty input', () => {
    const { totalBalance, unpaidClosedTotal } = calculateBalanceTotals([], {});
    expect(totalBalance).toBe(0);
    expect(unpaidClosedTotal).toBe(0);
  });

  it('does not accumulate unpaid when closedPeriod is paid', () => {
    const cc = makeCreditCard({ id: 'cc-1', creditLimit: 5000 });
    const stmt = makeStatement('cc-1', {
      closedPeriod: {
        balance: 500,
        isPaid: true,
        startDate: '',
        endDate: '',
        paymentDueDate: '',
        daysUntilDue: 0,
        transactions: [],
      },
    });
    const { unpaidClosedTotal } = calculateBalanceTotals([cc], { 'cc-1': stmt });
    expect(unpaidClosedTotal).toBe(0);
  });
});
