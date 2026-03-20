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

export function getNextDueDate(dueDay: number): Date {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Si el día de vencimiento ya pasó este mes, tomar el siguiente mes
  if (dueDay < currentDay) {
    return new Date(currentYear, currentMonth + 1, dueDay);
  }

  // Si el día de vencimiento es este mes o futuro
  return new Date(currentYear, currentMonth, dueDay);
}

export function getOrdinalDay(day: number): string {
  return `${day}`;
}

export function getDaysUntilDue(dueDay: number): number {
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  if (dueDay >= currentDay) {
    return dueDay - currentDay;
  }
  return daysInMonth - currentDay + dueDay;
}

export function isDueSoon(dueDay: number, days = 3): boolean {
  return getDaysUntilDue(dueDay) <= days;
}

export function isOverdue(dueDay: number): boolean {
  const today = new Date().getDate();
  return dueDay < today;
}
