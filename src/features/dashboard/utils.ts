import type { MonthlySummary, CategoryComparison } from '../../types';

export function getPrevMonth(month: number, year: number): { month: number; year: number } {
  if (month === 1) return { month: 12, year: year - 1 };
  return { month: month - 1, year };
}

export function calcDiffPct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function mergeCategories(
  current: MonthlySummary,
  previous: MonthlySummary
): CategoryComparison[] {
  const map = new Map<string, CategoryComparison>();

  current.categories.forEach((cat) => {
    map.set(cat.id, {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      current: cat.total,
      previous: 0,
      diff: cat.total,
      diffPercentage: null,
      trend: 'up',
    });
  });

  previous.categories.forEach((cat) => {
    if (map.has(cat.id)) {
      const entry = map.get(cat.id)!;
      const diff = entry.current - cat.total;
      map.set(cat.id, {
        ...entry,
        previous: cat.total,
        diff,
        diffPercentage: calcDiffPct(entry.current, cat.total),
        trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
      });
    } else {
      map.set(cat.id, {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        current: 0,
        previous: cat.total,
        diff: -cat.total,
        diffPercentage: -100,
        trend: 'down',
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => b.current - a.current);
}
