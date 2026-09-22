import { useState, useCallback, useEffect, useRef } from 'react';
import { pickDefaultSelection, pruneSelection, MAX_SELECTED_CATEGORIES } from '../utils';
import type { CategorySeries } from '../types';

export interface UseCategorySelectionReturn {
  selectedCategoryIds: string[];
  isSelectionFull: boolean;
  toggleCategory: (categoryId: string) => void;
  /** Vuelve a poner la selección en estado "no inicializada" — el próximo
   * `series` estable dispara un top-8 nuevo en vez de una poda (criterio 4:
   * cambiar el toggle Gasto/Ingreso reaplica la preselección). */
  resetSelection: () => void;
}

/**
 * Ciclo de vida de la selección de categorías de la página Análisis: top-8
 * automático al montar o tras `resetSelection()`, poda (nunca
 * re-preselección) ante cualquier otro cambio de `series` — cambio de cuenta
 * o de rango de fechas (criterio 5) —, y tope duro de 8 (criterio 3).
 */
export function useCategorySelection(
  series: CategorySeries[],
  loading: boolean,
  error: string | null
): UseCategorySelectionReturn {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const selectionInitializedRef = useRef(false);

  useEffect(() => {
    // Mientras carga o hay error, `series` puede venir vacía por la
    // transición de queryKey (no por falta real de datos) — podar aquí
    // vaciaría la selección de golpe. Se espera al próximo dato estable.
    if (loading || error) return;

    setSelectedCategoryIds((prev) => {
      if (!selectionInitializedRef.current) {
        selectionInitializedRef.current = true;
        return pickDefaultSelection(series);
      }
      return pruneSelection(prev, series);
    });
  }, [series, loading, error]);

  const toggleCategory = useCallback((categoryId: string) => {
    selectionInitializedRef.current = true;
    setSelectedCategoryIds((prev) => {
      const isSelected = prev.includes(categoryId);
      if (!isSelected && prev.length >= MAX_SELECTED_CATEGORIES) return prev;
      return isSelected ? prev.filter((id) => id !== categoryId) : [...prev, categoryId];
    });
  }, []);

  const resetSelection = useCallback(() => {
    selectionInitializedRef.current = false;
  }, []);

  return {
    selectedCategoryIds,
    isSelectionFull: selectedCategoryIds.length >= MAX_SELECTED_CATEGORIES,
    toggleCategory,
    resetSelection,
  };
}
