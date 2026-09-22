import { Card, CardContent } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { CategoryIcon } from '../../../components/ui/category-icon';
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
          <div className="max-h-56 space-y-1 overflow-auto">
            {series.map(({ category }) => {
              const isSelected = selectedCategoryIds.includes(category.id);
              const disabled = !isSelected && isSelectionFull;

              return (
                <label
                  key={category.id}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'
                  }`}
                  title={
                    disabled
                      ? `Ya hay ${MAX_SELECTED_CATEGORIES} categorías seleccionadas — desmarca una para agregar otra`
                      : undefined
                  }
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={disabled}
                    onChange={() => onToggleCategory(category.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <CategoryIcon icon={category.icon} color={category.color} size="sm" />
                  <span>{category.name}</span>
                </label>
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
