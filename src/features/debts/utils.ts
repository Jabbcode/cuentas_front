import type { Debt, RecurringDebtPayment } from '../../types';
import type { DebtGroups, DebtTotals } from './types';

/** Splits debts into three status groups. */
export function groupDebtsByStatus(debts: Debt[]): DebtGroups {
  return {
    activeDebts: debts.filter((d) => d.status === 'active'),
    overdueDebts: debts.filter((d) => d.status === 'overdue'),
    paidDebts: debts.filter((d) => d.status === 'paid'),
  };
}

/** Sums remaining amounts for active and overdue debts. */
export function calculateDebtTotals(groups: DebtGroups): DebtTotals {
  return {
    totalActiveDebt: groups.activeDebts.reduce((sum, d) => sum + Number(d.remainingAmount), 0),
    totalOverdueDebt: groups.overdueDebts.reduce((sum, d) => sum + Number(d.remainingAmount), 0),
  };
}

/** Returns Tailwind classes for a debt status badge. */
export function getStatusBadgeClasses(status: Debt['status']): string {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'overdue':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-blue-100 text-blue-700 border-blue-200';
  }
}

/** Returns human-readable label for a debt status. */
export function getStatusText(status: Debt['status']): string {
  switch (status) {
    case 'paid':
      return 'Pagada';
    case 'overdue':
      return 'Vencida';
    default:
      return 'Activa';
  }
}

/** Calculates the payment progress percentage for a debt (0–100). */
export function calcProgressPercentage(totalAmount: number, remainingAmount: number): number {
  if (totalAmount === 0) return 0;
  return ((totalAmount - remainingAmount) / totalAmount) * 100;
}

/** Calculates interest for a single payment given the debt's interest config. */
export function calcInterest(
  remainingAmount: number,
  interestRate?: number,
  interestType?: 'fixed' | 'percentage'
): number {
  if (!interestRate || !interestType) return 0;
  if (interestType === 'percentage') {
    return (remainingAmount * interestRate) / 100;
  }
  return interestRate;
}

/** Filters recurring payments belonging to a specific debt. */
export function filterRecurringByDebt(
  recurringPayments: RecurringDebtPayment[],
  debtId: string
): RecurringDebtPayment[] {
  return recurringPayments.filter((rp) => rp.debtId === debtId);
}

/** Returns a human-readable schedule description for a recurring payment. */
export function getScheduleText(payment: RecurringDebtPayment): string {
  const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  if (payment.frequency === 'monthly') {
    return `Día ${payment.dayOfMonth} de cada mes`;
  }
  if (payment.frequency === 'weekly') {
    return `Cada ${DAYS_OF_WEEK[payment.dayOfWeek ?? 0]}`;
  }
  return 'Cada 14 días';
}

/** Formats a date string in short Spanish locale. */
export function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Formats a date string including time, in Spanish locale. */
export function formatDateWithTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Suggests a monthly payment amount based on a 12-month payoff target. */
export function suggestMonthlyAmount(remainingAmount: number): number {
  return remainingAmount / 12;
}

/** Estimates how many periods are needed to pay off a debt. */
export function calcPeriodsToPayOff(remainingAmount: number, paymentAmount: number): number {
  if (paymentAmount <= 0) return 0;
  return Math.ceil(remainingAmount / paymentAmount);
}
