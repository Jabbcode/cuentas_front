import { MONTHS_SHORT } from '../../lib/utils';
import type { CategorySeries } from './types';

export const MAX_SELECTED_CATEGORIES = 8;

/**
 * Paleta fija para las líneas del `CategoryTrendChart` — se usa cuando una
 * categoría no tiene `color` propio. Ciclada por índice de selección.
 */
export const CATEGORY_LINE_COLORS = [
  '#2563EB',
  '#DC2626',
  '#16A34A',
  '#D97706',
  '#7C3AED',
  '#DB2777',
  '#0891B2',
  '#65A30D',
];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Rango por defecto de la página Análisis: día 1 del mes en curso → hoy, en
 * componentes locales del navegador (nunca `toISOString()` sobre una fecha
 * local — ver ADR-002-fecha-clave-local-no-date-serializado).
 */
export function getDefaultAnalysisRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return {
    startDate: `${year}-${pad2(month)}-01`,
    endDate: `${year}-${pad2(month)}-${pad2(now.getDate())}`,
  };
}

/**
 * Primer y último día de un mes 'YYYY-MM', como 'YYYY-MM-DD'. El único uso de
 * `Date` aquí es como calculadora de "días en el mes" a partir de enteros
 * explícitos (sin parsear un string ni llamar `toISOString`), así que no
 * arrastra conversión de huso horario.
 */
export function monthKeyToDateRange(monthKey: string): { startDate: string; endDate: string } {
  const [year, month] = monthKey.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();

  return {
    startDate: `${year}-${pad2(month)}-01`,
    endDate: `${year}-${pad2(month)}-${pad2(lastDay)}`,
  };
}

/** Etiqueta del eje X en español, p. ej. 'Ene 2026'. */
export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return `${MONTHS_SHORT[month - 1]} ${year}`;
}

/**
 * Hasta `max` categorías con mayor monto — el backend ya devuelve `series`
 * ordenada por total desc / nombre asc (criterio 3), así que aquí solo se
 * recorta.
 */
export function pickDefaultSelection(
  series: Pick<CategorySeries, 'category'>[],
  max: number = MAX_SELECTED_CATEGORIES
): string[] {
  return series.slice(0, max).map((s) => s.category.id);
}

/**
 * Conserva el orden de `selected` y descarta los ids que ya no están en
 * `series` — nunca agrega ids nuevos, aunque `series` tenga categorías no
 * seleccionadas (casos límite de cambio de cuenta/rango de la spec).
 */
export function pruneSelection(
  selected: string[],
  series: Pick<CategorySeries, 'category'>[]
): string[] {
  const availableIds = new Set(series.map((s) => s.category.id));
  return selected.filter((id) => availableIds.has(id));
}

/** 'desde' debe ser anterior o igual a 'hasta' (comparación lexicográfica válida en YYYY-MM-DD). */
export function isValidRange(from: string, to: string): boolean {
  return Boolean(from) && Boolean(to) && from <= to;
}
