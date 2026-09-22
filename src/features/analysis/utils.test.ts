import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getDefaultAnalysisRange,
  monthKeyToDateRange,
  formatMonthLabel,
  pickDefaultSelection,
  pruneSelection,
  isValidRange,
  MAX_SELECTED_CATEGORIES,
} from './utils';
import type { CategorySeries } from './types';

function series(ids: string[]): Pick<CategorySeries, 'category'>[] {
  return ids.map((id) => ({ category: { id, name: id, icon: null, color: null } }));
}

describe('getDefaultAnalysisRange', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('el día 1 del mes, startDate y endDate coinciden', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 1)); // 1 de marzo de 2026, hora local

    expect(getDefaultAnalysisRange()).toEqual({ startDate: '2026-03-01', endDate: '2026-03-01' });
  });

  it('a fin de mes, endDate es el día de hoy y startDate el día 1', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 31)); // 31 de marzo de 2026

    expect(getDefaultAnalysisRange()).toEqual({ startDate: '2026-03-01', endDate: '2026-03-31' });
  });
});

describe('monthKeyToDateRange', () => {
  it('febrero de un año no bisiesto tiene 28 días', () => {
    expect(monthKeyToDateRange('2026-02')).toEqual({
      startDate: '2026-02-01',
      endDate: '2026-02-28',
    });
  });

  it('febrero de un año bisiesto tiene 29 días', () => {
    expect(monthKeyToDateRange('2028-02')).toEqual({
      startDate: '2028-02-01',
      endDate: '2028-02-29',
    });
  });

  it('un mes de 30 días', () => {
    expect(monthKeyToDateRange('2026-04')).toEqual({
      startDate: '2026-04-01',
      endDate: '2026-04-30',
    });
  });

  it('un mes de 31 días', () => {
    expect(monthKeyToDateRange('2026-01')).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    });
  });

  it('diciembre no se desborda a enero del año siguiente', () => {
    expect(monthKeyToDateRange('2026-12')).toEqual({
      startDate: '2026-12-01',
      endDate: '2026-12-31',
    });
  });
});

describe('formatMonthLabel', () => {
  it('formatea a "Mes corto Año" en español', () => {
    expect(formatMonthLabel('2026-01')).toBe('Ene 2026');
    expect(formatMonthLabel('2026-12')).toBe('Dic 2026');
  });
});

describe('pickDefaultSelection', () => {
  it('con 3 series, selecciona las 3', () => {
    expect(pickDefaultSelection(series(['a', 'b', 'c']))).toEqual(['a', 'b', 'c']);
  });

  it('con exactamente 8 series (el máximo), selecciona las 8', () => {
    const ids = Array.from({ length: 8 }, (_, i) => `cat-${i}`);
    expect(pickDefaultSelection(series(ids))).toEqual(ids);
    expect(pickDefaultSelection(series(ids))).toHaveLength(MAX_SELECTED_CATEGORIES);
  });

  it('con 12 series, recorta a las primeras 8 (el backend ya las ordena por monto)', () => {
    const ids = Array.from({ length: 12 }, (_, i) => `cat-${i}`);
    expect(pickDefaultSelection(series(ids))).toEqual(ids.slice(0, 8));
  });
});

describe('pruneSelection', () => {
  it('elimina de la selección los ids que ya no están en series', () => {
    expect(pruneSelection(['a', 'b', 'c'], series(['a', 'c']))).toEqual(['a', 'c']);
  });

  it('conserva el orden original de la selección', () => {
    expect(pruneSelection(['c', 'a', 'b'], series(['a', 'b', 'c']))).toEqual(['c', 'a', 'b']);
  });

  it('no auto-agrega categorías presentes en series que no estaban seleccionadas', () => {
    expect(pruneSelection(['a'], series(['a', 'b', 'c']))).toEqual(['a']);
  });
});

describe('isValidRange', () => {
  it('from < to es válido', () => {
    expect(isValidRange('2026-01-01', '2026-01-31')).toBe(true);
  });

  it('from === to es válido', () => {
    expect(isValidRange('2026-01-15', '2026-01-15')).toBe(true);
  });

  it('from > to es inválido', () => {
    expect(isValidRange('2026-02-01', '2026-01-01')).toBe(false);
  });

  it('cualquiera de los dos vacío es inválido', () => {
    expect(isValidRange('', '2026-01-01')).toBe(false);
    expect(isValidRange('2026-01-01', '')).toBe(false);
  });
});
