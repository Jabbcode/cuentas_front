import { X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { CategoryIcon } from '../../../components/ui/category-icon';
import type { CategoryInfo } from '../types';

interface Props {
  categories: CategoryInfo[];
  selected: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}

export function CategoryFilter({ categories, selected, onToggle, onClear }: Props) {
  if (categories.length === 0) return null;

  return (
    <Card className="p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Filtrar por categoria</span>
        {selected.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-7 text-xs">
            Limpiar
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selected.includes(category.id);
          return (
            <button
              key={category.id}
              onClick={() => onToggle(category.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all ${
                isSelected
                  ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CategoryIcon icon={category.icon} color={category.color} size="sm" />
              <span>{category.name}</span>
              {isSelected && <X className="h-3 w-3" />}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
