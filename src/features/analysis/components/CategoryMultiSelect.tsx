import { Card, CardContent } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { CategoryIcon } from '../../../components/ui/category-icon';
import { cn } from '../../../lib/utils';
import { MAX_SELECTED_CATEGORIES } from '../utils';
import type { CategorySeries } from '../types';

interface CategoryMultiSelectProps {
  series: CategorySeries[];
  selectedCategoryIds: string[];
  isSelectionFull: boolean;
  onToggleCategory: (categoryId: string) => void;
}

export function CategoryMultiSelect({
  series,
  selectedCategoryIds,
  isSelectionFull,
  onToggleCategory,
}: CategoryMultiSelectProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-xs">Categorías</Label>
          <span className="text-xs text-gray-500">
            {selectedCategoryIds.length}/{MAX_SELECTED_CATEGORIES}
          </span>
        </div>

        {series.length === 0 ? (
          <p className="text-sm text-gray-500">No hay categorías con movimientos.</p>
        ) : (
          <div className="flex max-h-64 flex-wrap gap-2 overflow-auto p-0.5">
            {series.map(({ category }) => {
              const isSelected = selectedCategoryIds.includes(category.id);
              const disabled = !isSelected && isSelectionFull;

              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={disabled}
                  onClick={() => onToggleCategory(category.id)}
                  title={
                    disabled
                      ? `Ya hay ${MAX_SELECTED_CATEGORIES} categorías seleccionadas — desmarca una para agregar otra`
                      : undefined
                  }
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors',
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50',
                    disabled && 'cursor-not-allowed opacity-50 hover:bg-white'
                  )}
                >
                  <CategoryIcon icon={category.icon} color={category.color} size="sm" />
                  {category.name}
                </button>
              );
            })}
          </div>
        )}

        {isSelectionFull && (
          <p className="mt-2 text-xs text-gray-500">
            Ya hay {MAX_SELECTED_CATEGORIES} categorías seleccionadas — desmarca una para agregar
            otra.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
