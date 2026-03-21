import { Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import type { Category } from '../../types';

interface TransactionFiltersProps {
  startDate: string;
  endDate: string;
  categoryId: string;
  type: 'all' | 'expense' | 'income';
  groupByCategory: boolean;
  categories: Category[];
  hasActiveFilters: boolean;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onTypeChange: (type: 'all' | 'expense' | 'income') => void;
  onGroupByCategoryChange: (grouped: boolean) => void;
  onClearFilters: () => void;
}

export function TransactionFilters({
  startDate,
  endDate,
  categoryId,
  type,
  groupByCategory,
  categories,
  hasActiveFilters,
  onStartDateChange,
  onEndDateChange,
  onCategoryChange,
  onTypeChange,
  onGroupByCategoryChange,
  onClearFilters,
}: TransactionFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros</span>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Filtro por fecha desde */}
          <div>
            <Label htmlFor="filter-start-date" className="text-xs">
              Desde
            </Label>
            <Input
              id="filter-start-date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Filtro por fecha hasta */}
          <div>
            <Label htmlFor="filter-end-date" className="text-xs">
              Hasta
            </Label>
            <Input
              id="filter-end-date"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Filtro por categoría */}
          <div>
            <Label htmlFor="filter-category" className="text-xs">
              Categoría
            </Label>
            <Select
              id="filter-category"
              value={categoryId}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="mt-1"
            >
              <option value="all">Todas</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Filtro por tipo */}
          <div>
            <Label htmlFor="filter-type" className="text-xs">
              Tipo
            </Label>
            <Select
              id="filter-type"
              value={type}
              onChange={(e) =>
                onTypeChange(e.target.value as 'all' | 'expense' | 'income')
              }
              className="mt-1"
            >
              <option value="all">Todos</option>
              <option value="expense">Gastos</option>
              <option value="income">Ingresos</option>
            </Select>
          </div>

          {/* Agrupar por categoría */}
          <div>
            <Label htmlFor="group-category" className="text-xs">
              Vista
            </Label>
            <Select
              id="group-category"
              value={groupByCategory ? 'grouped' : 'list'}
              onChange={(e) => onGroupByCategoryChange(e.target.value === 'grouped')}
              className="mt-1"
            >
              <option value="list">Lista</option>
              <option value="grouped">Agrupada</option>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
