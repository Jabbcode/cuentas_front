import { describe, it, expect } from 'vitest';
import type { MonthlySummary } from '../../../types';
import { getPrevMonth, calcDiffPct, mergeCategories } from '../utils';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeSummary = (
  month: number,
  year: number,
  categories: MonthlySummary['categories'] = []
): MonthlySummary => ({
  month,
  year,
  totalExpenses: 0,
  totalIncome: 0,
  net: 0,
  categories,
});

const makeCat = (id: string, total: number) => ({
  id,
  name: `Cat ${id}`,
  total,
  percentage: 0,
});

// ─── getPrevMonth ─────────────────────────────────────────────────────────────

describe('getPrevMonth', () => {
  it('returns previous month in the same year', () => {
    expect(getPrevMonth(6, 2024)).toEqual({ month: 5, year: 2024 });
  });

  it('wraps January to December of the previous year', () => {
    expect(getPrevMonth(1, 2024)).toEqual({ month: 12, year: 2023 });
  });

  it('handles December correctly', () => {
    expect(getPrevMonth(12, 2024)).toEqual({ month: 11, year: 2024 });
  });
});

// ─── calcDiffPct ──────────────────────────────────────────────────────────────

describe('calcDiffPct', () => {
  it('returns null when previous is 0', () => {
    expect(calcDiffPct(100, 0)).toBeNull();
  });

  it('returns 0 when current equals previous', () => {
    expect(calcDiffPct(100, 100)).toBe(0);
  });

  it('returns positive percentage when current is higher', () => {
    expect(calcDiffPct(150, 100)).toBe(50);
  });

  it('returns negative percentage when current is lower', () => {
    expect(calcDiffPct(50, 100)).toBe(-50);
  });

  it('rounds to nearest integer', () => {
    expect(calcDiffPct(133, 100)).toBe(33);
  });
});

// ─── mergeCategories ──────────────────────────────────────────────────────────

describe('mergeCategories', () => {
  it('includes categories only in current with previous=0 and trend=up', () => {
    const current = makeSummary(5, 2024, [makeCat('cat-1', 300)]);
    const previous = makeSummary(4, 2024, []);

    const result = mergeCategories(current, previous);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'cat-1', current: 300, previous: 0, trend: 'up' });
  });

  it('includes categories only in previous with current=0, diff=-total and trend=down', () => {
    const current = makeSummary(5, 2024, []);
    const previous = makeSummary(4, 2024, [makeCat('cat-1', 200)]);

    const result = mergeCategories(current, previous);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'cat-1',
      current: 0,
      previous: 200,
      diff: -200,
      diffPercentage: -100,
      trend: 'down',
    });
  });

  it('merges a category present in both months', () => {
    const current = makeSummary(5, 2024, [makeCat('cat-1', 300)]);
    const previous = makeSummary(4, 2024, [makeCat('cat-1', 200)]);

    const result = mergeCategories(current, previous);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'cat-1',
      current: 300,
      previous: 200,
      diff: 100,
      diffPercentage: 50,
      trend: 'up',
    });
  });

  it('sets trend=down when current < previous', () => {
    const current = makeSummary(5, 2024, [makeCat('cat-1', 100)]);
    const previous = makeSummary(4, 2024, [makeCat('cat-1', 200)]);

    const [entry] = mergeCategories(current, previous);
    expect(entry.trend).toBe('down');
  });

  it('sets trend=same when current equals previous', () => {
    const current = makeSummary(5, 2024, [makeCat('cat-1', 200)]);
    const previous = makeSummary(4, 2024, [makeCat('cat-1', 200)]);

    const [entry] = mergeCategories(current, previous);
    expect(entry.trend).toBe('same');
  });

  it('sorts results by current amount descending', () => {
    const current = makeSummary(5, 2024, [makeCat('cat-a', 100), makeCat('cat-b', 500)]);
    const previous = makeSummary(4, 2024, []);

    const result = mergeCategories(current, previous);

    expect(result.map((r) => r.id)).toEqual(['cat-b', 'cat-a']);
  });

  it('returns empty array for two empty summaries', () => {
    expect(mergeCategories(makeSummary(5, 2024), makeSummary(4, 2024))).toHaveLength(0);
  });
});
