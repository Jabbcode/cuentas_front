import type { CreditCardStatement } from '../../types';

/**
 * Computes the total unpaid balance across all statements (closed periods only).
 */
export function computeTotalToPay(statements: CreditCardStatement[]): number {
  return statements.reduce(
    (sum, s) => sum + (s.closedPeriod.isPaid ? 0 : s.closedPeriod.balance),
    0
  );
}

/**
 * Counts cards with an unpaid closed period.
 */
export function countPendingCards(statements: CreditCardStatement[]): number {
  return statements.filter((s) => !s.closedPeriod.isPaid).length;
}

/**
 * Computes the sum of all current-period balances.
 */
export function computeCurrentPeriodTotal(statements: CreditCardStatement[]): number {
  return statements.reduce((sum, s) => sum + s.currentPeriod.balance, 0);
}

/**
 * Computes total credit used = current + unpaid closed across all cards.
 */
export function computeTotalUsed(statements: CreditCardStatement[]): number {
  return statements.reduce(
    (sum, s) =>
      sum + s.currentPeriod.balance + (s.closedPeriod.isPaid ? 0 : s.closedPeriod.balance),
    0
  );
}

/**
 * Returns today's date formatted as YYYY-MM-DD for use in date inputs.
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
