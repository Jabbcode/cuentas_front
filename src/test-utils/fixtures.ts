import type { Account } from '../types';

export function fakeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: 'a1',
    name: 'Cuenta 1',
    type: 'bank',
    balance: 100,
    currency: 'EUR',
    createdAt: '2026-01-01',
    ...overrides,
  } as Account;
}
