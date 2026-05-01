import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { CategoryIcon } from '../../../components/ui/category-icon';
import { CategoryLimitDisplay } from './CategoryLimitDisplay';
import type { Category } from '../../../types';

export interface CategoryListProps {
  /** Categories to display in this list */
  items: Category[];
  /** Section title (e.g. "Gastos", "Ingresos") */
  title: string;
  /** Called when the user clicks edit on a category */
  onEdit: (category: Category) => void;
  /** Called when the user clicks delete on a category */
  onDelete: (id: string) => void;
}

export function CategoryList({ items, title, onEdit, onDelete }: CategoryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 transition-all hover:shadow-sm lg:flex-row lg:items-center lg:justify-between lg:gap-0"
            >
              <div className="flex items-center justify-between lg:flex-1">
                <div className="flex items-center gap-3">
                  <CategoryIcon icon={cat.icon} color={cat.color} size="lg" tooltip={cat.name} />
                  <span className="font-medium text-gray-900">{cat.name}</span>
                  {cat.monthlyLimit && (
                    <div className="ml-2 hidden lg:block">
                      <CategoryLimitDisplay categoryId={cat.id} />
                    </div>
                  )}
                </div>
                <div className="flex gap-1 lg:hidden">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(cat)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(cat.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {cat.monthlyLimit && (
                <div className="ml-11 lg:hidden">
                  <CategoryLimitDisplay categoryId={cat.id} />
                </div>
              )}
              <div className="hidden gap-1 lg:flex">
                <Button variant="ghost" size="icon" onClick={() => onEdit(cat)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(cat.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="py-8 text-center text-gray-500">Sin categorías</p>}
        </div>
      </CardContent>
    </Card>
  );
}
