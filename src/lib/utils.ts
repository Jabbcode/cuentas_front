import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date));
}

export function getNextDueDate(dueDay: number, isPaidThisMonth = true, isCreditCard = false): Date {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Si el día de vencimiento ya pasó este mes
  if (dueDay < currentDay) {
    // Para tarjetas de crédito, siempre usar mes siguiente (el backend calcula la fecha real)
    if (isCreditCard) {
      return new Date(currentYear, currentMonth + 1, dueDay);
    }
    // Para gastos fijos: Si NO está pagado, mostrar fecha del mes actual (vencida)
    if (!isPaidThisMonth) {
      return new Date(currentYear, currentMonth, dueDay);
    }
    // Si ya está pagado, mostrar fecha del mes siguiente
    return new Date(currentYear, currentMonth + 1, dueDay);
  }

  // Si el día de vencimiento es este mes o futuro
  return new Date(currentYear, currentMonth, dueDay);
}

export function getOrdinalDay(day: number): string {
  return `${day}`;
}

export function getDaysUntilDue(dueDay: number, isPaidThisMonth = true, isCreditCard = false): number {
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  if (dueDay >= currentDay) {
    return dueDay - currentDay;
  }

  // Para tarjetas de crédito, siempre calcular al mes siguiente
  if (isCreditCard) {
    return daysInMonth - currentDay + dueDay;
  }

  // Si el día ya pasó y NO está pagado, retornar días negativos (vencido)
  if (!isPaidThisMonth) {
    return dueDay - currentDay;
  }

  // Si ya está pagado, calcular días hasta el mes siguiente
  return daysInMonth - currentDay + dueDay;
}

export function isDueSoon(dueDay: number, isPaidThisMonth = true, isCreditCard = false, days = 3): boolean {
  const daysUntil = getDaysUntilDue(dueDay, isPaidThisMonth, isCreditCard);
  return daysUntil >= 0 && daysUntil <= days;
}

export function isOverdue(dueDay: number, isPaidThisMonth = true, isCreditCard = false): boolean {
  if (isPaidThisMonth || isCreditCard) return false;

  const today = new Date();
  const currentDay = today.getDate();
  return dueDay < currentDay;
}
