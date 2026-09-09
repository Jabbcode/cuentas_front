import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCreditCardPeriod,
  isInClosedPeriod,
  getClosedPeriodWarning,
  getUsageColor,
  getDaysColor,
} from '../credit-card-utils';
import type { Transaction, Account } from '../../types';

function fakeTx(date: string): Transaction {
  return { date } as unknown as Transaction;
}

function fakeAccount(overrides: Partial<Account> = {}): Pick<Account, 'id' | 'type' | 'cutoffDay'> {
  return { id: 'acc-1', type: 'credit_card', cutoffDay: 5, ...overrides } as Account;
}

describe('getCreditCardPeriod', () => {
  it('sin cuenta: devuelve null', () => {
    expect(getCreditCardPeriod(fakeTx('2026-06-10'))).toBeNull();
  });

  it('cuenta que no es tarjeta de crédito: devuelve null', () => {
    expect(getCreditCardPeriod(fakeTx('2026-06-10'), fakeAccount({ type: 'bank' }))).toBeNull();
  });

  it('sin cutoffDay configurado: devuelve null', () => {
    expect(getCreditCardPeriod(fakeTx('2026-06-10'), fakeAccount({ cutoffDay: null }))).toBeNull();
  });

  it('transacción en o después del corte: período va del corte de este mes al día antes del corte del próximo', () => {
    const period = getCreditCardPeriod(fakeTx('2026-06-05T00:00:00'), fakeAccount());
    expect(period?.start).toEqual(new Date(2026, 5, 5));
    expect(period?.end).toEqual(new Date(2026, 6, 4));
  });

  it('transacción antes del corte: pertenece al período del mes anterior', () => {
    const period = getCreditCardPeriod(fakeTx('2026-06-03T00:00:00'), fakeAccount());
    expect(period?.start).toEqual(new Date(2026, 4, 5));
    expect(period?.end).toEqual(new Date(2026, 5, 4));
  });
});

describe('isInClosedPeriod / getClosedPeriodWarning (hoy fijo: 15 jun 2026, cutoffDay=5)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isInClosedPeriod', () => {
    it('sin cuenta: false', () => {
      expect(isInClosedPeriod('2026-05-01')).toBe(false);
    });

    it('no es tarjeta de crédito: false', () => {
      expect(isInClosedPeriod('2026-05-01', { type: 'bank', cutoffDay: 5 })).toBe(false);
    });

    it('fecha anterior al último corte: true', () => {
      expect(isInClosedPeriod('2026-06-01', fakeAccount())).toBe(true);
    });

    it('fecha en o después del último corte: false', () => {
      expect(isInClosedPeriod('2026-06-10', fakeAccount())).toBe(false);
    });
  });

  describe('getClosedPeriodWarning', () => {
    it('fecha en período abierto: null', () => {
      expect(getClosedPeriodWarning('2026-06-10', fakeAccount())).toBeNull();
    });

    it('fecha en período cerrado: devuelve warning tipo error con el corte mencionado', () => {
      const warning = getClosedPeriodWarning('2026-06-01', fakeAccount());
      expect(warning?.type).toBe('error');
      expect(warning?.message).toContain('período ya cerrado');
    });
  });
});

describe('getUsageColor', () => {
  it.each([
    [95, 'bg-red-500'],
    [85, 'bg-orange-500'],
    [70, 'bg-yellow-500'],
    [30, 'bg-green-500'],
  ])('%i%% -> %s', (pct, expected) => {
    expect(getUsageColor(pct)).toBe(expected);
  });
});

describe('getDaysColor', () => {
  it('balance en 0: siempre gris, sin importar los días', () => {
    expect(getDaysColor(-5, 0)).toBe('text-gray-600');
  });

  it.each([
    [-1, 'text-red-600'],
    [2, 'text-orange-600'],
    [5, 'text-yellow-600'],
    [10, 'text-gray-600'],
  ])('con balance > 0, %i días -> %s', (days, expected) => {
    expect(getDaysColor(days, 100)).toBe(expected);
  });
});
