import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  cn,
  formatCurrency,
  formatDate,
  formatShortDate,
  getNextDueDate,
  getDaysUntilDue,
  isDueSoon,
  isOverdue,
} from '../utils';

describe('cn', () => {
  it('combina clases y resuelve conflictos de Tailwind (la última gana)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('ignora valores falsy', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });
});

describe('formatCurrency', () => {
  it('formatea en EUR por defecto con 2 decimales', () => {
    expect(formatCurrency(1234.5)).toContain('1234,50');
  });

  it('acepta otra moneda', () => {
    const result = formatCurrency(10, 'USD');
    expect(result).toMatch(/US\$|USD/);
  });
});

describe('formatDate / formatShortDate', () => {
  it('formatDate incluye día, mes corto y año', () => {
    const result = formatDate('2026-03-15T00:00:00.000Z');
    expect(result).toMatch(/mar/i);
    expect(result).toContain('2026');
  });

  it('formatShortDate no incluye el año', () => {
    const result = formatShortDate('2026-03-15T00:00:00.000Z');
    expect(result).not.toContain('2026');
  });
});

describe('fechas de vencimiento (hoy fijo: 15 jun 2026)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getNextDueDate', () => {
    it('día futuro este mes: devuelve la fecha de este mes', () => {
      expect(getNextDueDate(20)).toEqual(new Date(2026, 5, 20));
    });

    it('gasto fijo vencido y no pagado: devuelve la fecha vencida de este mes', () => {
      expect(getNextDueDate(10, false, false)).toEqual(new Date(2026, 5, 10));
    });

    it('gasto fijo vencido pero ya pagado: pasa al mes siguiente', () => {
      expect(getNextDueDate(10, true, false)).toEqual(new Date(2026, 6, 10));
    });

    it('tarjeta de crédito con día pasado: siempre pasa al mes siguiente sin importar isPaidThisMonth', () => {
      expect(getNextDueDate(10, false, true)).toEqual(new Date(2026, 6, 10));
    });
  });

  describe('getDaysUntilDue', () => {
    it('día futuro: devuelve los días restantes', () => {
      expect(getDaysUntilDue(20)).toBe(5);
    });

    it('día vencido y no pagado: devuelve negativo', () => {
      expect(getDaysUntilDue(10, false, false)).toBe(-5);
    });

    it('día vencido pero pagado: cuenta hasta el mes siguiente', () => {
      expect(getDaysUntilDue(10, true, false)).toBe(30 - 15 + 10);
    });

    it('tarjeta de crédito vencida: siempre cuenta al mes siguiente', () => {
      expect(getDaysUntilDue(10, false, true)).toBe(30 - 15 + 10);
    });
  });

  describe('isDueSoon', () => {
    it('true cuando faltan 3 días o menos', () => {
      expect(isDueSoon(18)).toBe(true);
    });

    it('false cuando faltan más de 3 días', () => {
      expect(isDueSoon(25)).toBe(false);
    });

    it('false cuando ya venció (días negativos)', () => {
      expect(isDueSoon(10, false, false)).toBe(false);
    });
  });

  describe('isOverdue', () => {
    it('true si no está pagado y el día ya pasó', () => {
      expect(isOverdue(10, false, false)).toBe(true);
    });

    it('false si ya está pagado', () => {
      expect(isOverdue(10, true, false)).toBe(false);
    });

    it('false para tarjetas de crédito aunque el día haya pasado', () => {
      expect(isOverdue(10, false, true)).toBe(false);
    });

    it('false si el día aún no llega', () => {
      expect(isOverdue(20, false, false)).toBe(false);
    });
  });
});
