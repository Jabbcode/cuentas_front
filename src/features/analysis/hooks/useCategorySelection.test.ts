import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCategorySelection } from './useCategorySelection';
import type { CategorySeries } from '../types';

function series(ids: string[]): CategorySeries[] {
  return ids.map((id) => ({
    category: { id, name: id, icon: null, color: null },
    total: 0,
    points: [],
  }));
}

const EMPTY_SERIES: CategorySeries[] = [];

describe('useCategorySelection', () => {
  it('arranca sin selección', () => {
    // Referencia estable: si se recreara dentro del callback de renderHook,
    // cada re-render disparado por el propio efecto vería una `series` nueva
    // y entraría en bucle (el efecto también produce arrays nuevos vía
    // pickDefaultSelection/pruneSelection).
    const { result } = renderHook(() => useCategorySelection(EMPTY_SERIES, false, null));

    expect(result.current.selectedCategoryIds).toEqual([]);
    expect(result.current.isSelectionFull).toBe(false);
  });

  it('selecciona hasta 8 categorías por defecto (top-8 ya ordenado)', async () => {
    const ids = Array.from({ length: 10 }, (_, i) => `cat-${i}`);
    const data = series(ids); // referencia estable — ver nota arriba
    const { result } = renderHook(() => useCategorySelection(data, false, null));

    await waitFor(() => expect(result.current.selectedCategoryIds).toEqual(ids.slice(0, 8)));
    expect(result.current.isSelectionFull).toBe(true);
  });

  it('mientras loading o error, no aplica el top-8 (evita vaciar la selección por una transición de queryKey)', () => {
    const { result, rerender } = renderHook(
      ({ s, loading, error }) => useCategorySelection(s, loading, error),
      { initialProps: { s: series(['a', 'b']), loading: true, error: null as string | null } }
    );
    expect(result.current.selectedCategoryIds).toEqual([]);

    rerender({ s: EMPTY_SERIES, loading: false, error: 'boom' });
    expect(result.current.selectedCategoryIds).toEqual([]);
  });

  it('un cambio de series (cuenta/rango) poda la selección sin re-preseleccionar', async () => {
    const { result, rerender } = renderHook(({ s }) => useCategorySelection(s, false, null), {
      initialProps: { s: series(['a', 'b', 'c']) },
    });
    await waitFor(() => expect(result.current.selectedCategoryIds).toEqual(['a', 'b', 'c']));

    rerender({ s: series(['a', 'c', 'd']) }); // 'b' ya no tiene movimiento, 'd' es nueva

    await waitFor(() => expect(result.current.selectedCategoryIds).toEqual(['a', 'c']));
    expect(result.current.selectedCategoryIds).not.toContain('d');
  });

  it('toggleCategory agrega y quita categorías', async () => {
    const data = series(['a', 'b']);
    const { result } = renderHook(() => useCategorySelection(data, false, null));
    await waitFor(() => expect(result.current.selectedCategoryIds).toEqual(['a', 'b']));

    act(() => result.current.toggleCategory('a'));
    expect(result.current.selectedCategoryIds).toEqual(['b']);

    act(() => result.current.toggleCategory('a'));
    expect(result.current.selectedCategoryIds).toEqual(['b', 'a']);
  });

  it('con 8 seleccionadas, toggleCategory sobre una 9ª no cambia nada', async () => {
    const ids = Array.from({ length: 9 }, (_, i) => `cat-${i}`);
    const data = series(ids);
    const { result } = renderHook(() => useCategorySelection(data, false, null));
    await waitFor(() => expect(result.current.selectedCategoryIds).toHaveLength(8));

    act(() => result.current.toggleCategory('cat-8'));

    expect(result.current.selectedCategoryIds).toHaveLength(8);
    expect(result.current.selectedCategoryIds).not.toContain('cat-8');
  });

  it('resetSelection hace que el próximo dato estable recalcule el top-8', async () => {
    const { result, rerender } = renderHook(({ s }) => useCategorySelection(s, false, null), {
      initialProps: { s: series(['a', 'b']) },
    });
    await waitFor(() => expect(result.current.selectedCategoryIds).toEqual(['a', 'b']));

    act(() => result.current.toggleCategory('a')); // selección manual: ['b']
    act(() => result.current.resetSelection());
    rerender({ s: series(['x', 'y', 'z']) }); // simula el cambio de type con datos nuevos

    await waitFor(() => expect(result.current.selectedCategoryIds).toEqual(['x', 'y', 'z']));
  });
});
