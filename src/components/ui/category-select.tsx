import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { CategoryIcon } from './category-icon';
import { cn } from '../../lib/utils';
import type { Category } from '../../types';

interface CategorySelectProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function CategorySelect({
  categories,
  value,
  onChange,
  placeholder = 'Seleccionar categoría',
  required,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find((c) => c.id === value);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required
          className="absolute opacity-0 h-0 w-0"
          tabIndex={-1}
        />
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors',
          'hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200',
          isOpen && 'border-blue-500 ring-2 ring-blue-200'
        )}
      >
        {selectedCategory ? (
          <div className="flex items-center gap-2">
            <CategoryIcon
              icon={selectedCategory.icon}
              color={selectedCategory.color}
              size="md"
            />
            <span className="text-gray-900">{selectedCategory.name}</span>
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            {categories.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No hay categorías</div>
            ) : (
              categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    onChange(category.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-gray-100',
                    value === category.id && 'bg-blue-50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CategoryIcon
                      icon={category.icon}
                      color={category.color}
                      size="md"
                    />
                    <span className="text-gray-900">{category.name}</span>
                  </div>
                  {value === category.id && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
