import { useState } from 'react';
import { categoryIcons, iconCategories } from '../../lib/category-icons';
import { cn } from '../../lib/utils';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  color?: string;
}

export function IconPicker({ value, onChange, color = '#3B82F6' }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const SelectedIcon = categoryIcons[value] || categoryIcons['Receipt'];

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-xl border-2 border-gray-200 bg-white transition-all hover:border-gray-300',
          isOpen && 'border-blue-500 ring-2 ring-blue-200'
        )}
      >
        <SelectedIcon className="h-6 w-6" style={{ color }} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-14 z-20 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-xl">
            <div className="max-h-64 overflow-y-auto space-y-3">
              {iconCategories.map((category) => (
                <div key={category.name}>
                  <p className="mb-1.5 text-xs font-medium text-gray-500">{category.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {category.icons.map((iconName) => {
                      const Icon = categoryIcons[iconName];
                      if (!Icon) return null;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => {
                            onChange(iconName);
                            setIsOpen(false);
                          }}
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-md transition-all hover:bg-gray-100',
                            value === iconName && 'bg-blue-100 ring-2 ring-blue-500'
                          )}
                          title={iconName}
                        >
                          <Icon className="h-4 w-4" style={{ color }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
