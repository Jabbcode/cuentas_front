import type { Transaction, Account } from '../types';

export interface CreditCardPeriod {
  start: Date;
  end: Date;
  label: string;
}

/**
 * Calcula el período de facturación de una tarjeta de crédito para una transacción específica
 */
export function getCreditCardPeriod(
  transaction: Transaction,
  account?: Pick<Account, 'id' | 'type' | 'cutoffDay'>
): CreditCardPeriod | null {
  if (!account || account.type !== 'credit_card' || !account.cutoffDay) {
    return null;
  }

  const txDate = new Date(transaction.date);
  const cutoffDay = account.cutoffDay;
  const txDay = txDate.getDate();
  const txMonth = txDate.getMonth();
  const txYear = txDate.getFullYear();

  let periodStart: Date;
  let periodEnd: Date;

  if (txDay >= cutoffDay) {
    // Transaction is in current period
    periodStart = new Date(txYear, txMonth, cutoffDay);
    periodEnd = new Date(txYear, txMonth + 1, cutoffDay - 1);
  } else {
    // Transaction is in previous period
    periodStart = new Date(txYear, txMonth - 1, cutoffDay);
    periodEnd = new Date(txYear, txMonth, cutoffDay - 1);
  }

  return {
    start: periodStart,
    end: periodEnd,
    label: `${periodStart.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - ${periodEnd.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`,
  };
}

/**
 * Verifica si una fecha está en un período cerrado de tarjeta de crédito
 */
export function isInClosedPeriod(
  date: string,
  account?: Pick<Account, 'type' | 'cutoffDay'>
): boolean {
  if (!account || account.type !== 'credit_card' || !account.cutoffDay) {
    return false;
  }

  const selectedDate = new Date(date);
  const today = new Date();
  const cutoffDay = account.cutoffDay;

  // Calculate last cutoff date
  let lastCutoff: Date;
  if (today.getDate() >= cutoffDay) {
    lastCutoff = new Date(today.getFullYear(), today.getMonth(), cutoffDay);
  } else {
    lastCutoff = new Date(today.getFullYear(), today.getMonth() - 1, cutoffDay);
  }

  // If selected date is before last cutoff, it's in a closed period
  return selectedDate < lastCutoff;
}

/**
 * Genera mensaje de advertencia para fechas en períodos cerrados
 */
export function getClosedPeriodWarning(
  date: string,
  account?: Pick<Account, 'type' | 'cutoffDay'>
): { type: 'error'; message: string } | null {
  if (!isInClosedPeriod(date, account)) {
    return null;
  }

  const today = new Date();
  const cutoffDay = account!.cutoffDay!;

  let lastCutoff: Date;
  if (today.getDate() >= cutoffDay) {
    lastCutoff = new Date(today.getFullYear(), today.getMonth(), cutoffDay);
  } else {
    lastCutoff = new Date(today.getFullYear(), today.getMonth() - 1, cutoffDay);
  }

  return {
    type: 'error',
    message: `Esta fecha pertenece a un período ya cerrado (antes del ${lastCutoff.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}). Los cargos deberían ir al período actual.`,
  };
}

/**
 * Obtiene el color de la barra de uso según el porcentaje
 */
export function getUsageColor(percentage: number): string {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 80) return 'bg-orange-500';
  if (percentage >= 60) return 'bg-yellow-500';
  return 'bg-green-500';
}

/**
 * Obtiene el color del texto de días hasta vencimiento
 */
export function getDaysColor(days: number, balance: number): string {
  if (balance === 0) return 'text-gray-600';
  if (days <= 0) return 'text-red-600';
  if (days <= 3) return 'text-orange-600';
  if (days <= 7) return 'text-yellow-600';
  return 'text-gray-600';
}
