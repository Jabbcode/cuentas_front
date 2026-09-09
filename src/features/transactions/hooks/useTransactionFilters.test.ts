import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransactionFilters } from './useTransactionFilters';

describe('useTransactionFilters', () => {
  it('arranca sin filtros activos', () => {
    const { result } = renderHook(() => useTransactionFilters());

    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.filters.accountId).toBe('all');
    expect(result.current.filters.type).toBe('all');
  });

  it('toggleCategory agrega y luego quita la misma categoría', () => {
    const onFilterChange = vi.fn();
    const { result } = renderHook(() => useTransactionFilters(onFilterChange));

    act(() => result.current.toggleCategory('cat-1'));
    expect(result.current.filters.categoryIds).toEqual(['cat-1']);
    expect(onFilterChange).toHaveBeenCalledTimes(1);

    act(() => result.current.toggleCategory('cat-1'));
    expect(result.current.filters.categoryIds).toEqual([]);
  });

  it('removeCategory quita solo la categoría indicada', () => {
    const { result } = renderHook(() => useTransactionFilters());

    act(() => result.current.toggleCategory('cat-1'));
    act(() => result.current.toggleCategory('cat-2'));
    act(() => result.current.removeCategory('cat-1'));

    expect(result.current.filters.categoryIds).toEqual(['cat-2']);
  });

  it('cada setter marca hasActiveFilters=true, salvo minAmount/maxAmount', () => {
    const { result } = renderHook(() => useTransactionFilters());

    act(() => result.current.setStartDate('2026-01-01'));
    expect(result.current.hasActiveFilters).toBe(true);

    act(() => result.current.clearFilters());
    act(() => result.current.setAccountId('acc-1'));
    expect(result.current.hasActiveFilters).toBe(true);

    act(() => result.current.clearFilters());
    act(() => result.current.setType('expense'));
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('minAmount/maxAmount no llaman a onFilterChange ni cuentan para hasActiveFilters como los demás', () => {
    const onFilterChange = vi.fn();
    const { result } = renderHook(() => useTransactionFilters(onFilterChange));

    act(() => result.current.setMinAmount('10'));
    act(() => result.current.setMaxAmount('100'));

    expect(onFilterChange).not.toHaveBeenCalled();
    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.filters.minAmount).toBe('10');
    expect(result.current.filters.maxAmount).toBe('100');
  });

  it('clearFilters resetea todo a los valores por defecto', () => {
    const { result } = renderHook(() => useTransactionFilters());

    act(() => result.current.setStartDate('2026-01-01'));
    act(() => result.current.toggleCategory('cat-1'));
    act(() => result.current.setType('income'));

    act(() => result.current.clearFilters());

    expect(result.current.filters).toEqual({
      startDate: '',
      endDate: '',
      categoryIds: [],
      accountId: 'all',
      minAmount: '',
      maxAmount: '',
      type: 'all',
    });
    expect(result.current.hasActiveFilters).toBe(false);
  });
});
