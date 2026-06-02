import { useState, useRef, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { CategoryIcon } from '../../../components/ui/category-icon';
import type { Category, Account } from '../../../types';

interface TransactionFiltersProps {
  startDate: string;
  endDate: string;
  categoryIds: string[];
  accountId: string;
  minAmount: string;
  maxAmount: string;
  type: 'all' | 'expense' | 'income';
  categories: Category[];
  accounts: Account[];
  hasActiveFilters: boolean;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onToggleCategory: (categoryId: string) => void;
  onRemoveCategory: (categoryId: string) => void;
  onAccountChange: (accountId: string) => void;
  onMinAmountChange: (amount: string) => void;
  onMaxAmountChange: (amount: string) => void;
  onTypeChange: (type: 'all' | 'expense' | 'income') => void;
  onClearFilters: () => void;
}

export function TransactionFilters({
  startDate,
  endDate,
  categoryIds,
  accountId,
  minAmount,
  maxAmount,
  type,
  categories,
  accounts,
  hasActiveFilters,
  onStartDateChange,
  onEndDateChange,
  onToggleCategory,
  onRemoveCategory,
  onAccountChange,
  onMinAmountChange,
  onMaxAmountChange,
  onTypeChange,
  onClearFilters,
}: TransactionFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategories = categories.filter((c) => categoryIds.includes(c.id));
  const selectedAccount = accounts.find((a) => a.id === accountId);

  const chips: {
    key: string;
    label: string;
    icon?: string | null;
    color?: string | null;
    onRemove: () => void;
  }[] = [];

  if (startDate)
    chips.push({
      key: 'startDate',
      label: `Desde: ${startDate}`,
      onRemove: () => onStartDateChange(''),
    });
  if (endDate)
    chips.push({ key: 'endDate', label: `Hasta: ${endDate}`, onRemove: () => onEndDateChange('') });
  if (type !== 'all')
    chips.push({
      key: 'type',
      label: type === 'expense' ? 'Gastos' : 'Ingresos',
      onRemove: () => onTypeChange('all'),
    });
  if (accountId !== 'all' && selectedAccount)
    chips.push({
      key: 'accountId',
      label: `Cuenta: ${selectedAccount.name}`,
      onRemove: () => onAccountChange('all'),
    });
  selectedCategories.forEach((cat) => {
    chips.push({
      key: `cat-${cat.id}`,
      label: cat.name,
      icon: cat.icon,
      color: cat.color,
      onRemove: () => onRemoveCategory(cat.id),
    });
  });
  if (minAmount)
    chips.push({
      key: 'minAmount',
      label: `Mín: $${minAmount}`,
      onRemove: () => onMinAmountChange(''),
    });
  if (maxAmount)
    chips.push({
      key: 'maxAmount',
      label: `Máx: $${maxAmount}`,
      onRemove: () => onMaxAmountChange(''),
    });

  return (
    <Card>
      <CardContent className="p-4">
        {/* Header desktop */}
        <div className="hidden sm:flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros</span>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs">
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Botón colapsador mobile */}
        <div className="flex sm:hidden items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setIsFiltersOpen((prev) => !prev)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <Filter className="h-4 w-4 text-gray-500" />
            <span>Filtros</span>
            {chips.length > 0 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                {chips.length}
              </span>
            )}
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs">
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Bloque de filtros — visible siempre en desktop, condicional en mobile */}
        <div
          className={`overflow-hidden transition-all duration-200 sm:block ${isFiltersOpen ? 'block' : 'hidden'}`}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
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
            <div>
              <Label htmlFor="filter-type" className="text-xs">
                Tipo
              </Label>
              <Select
                id="filter-type"
                value={type}
                onChange={(e) => onTypeChange(e.target.value as 'all' | 'expense' | 'income')}
                className="mt-1"
              >
                <option value="all">Todos</option>
                <option value="expense">Gastos</option>
                <option value="income">Ingresos</option>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="filter-account" className="text-xs">
                Cuenta
              </Label>
              <Select
                id="filter-account"
                value={accountId}
                onChange={(e) => onAccountChange(e.target.value)}
                className="mt-1"
              >
                <option value="all">Todas las cuentas</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </Select>
            </div>

            <div ref={dropdownRef} className="relative">
              <Label className="text-xs">Categorías</Label>
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                className="mt-1 flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="truncate">
                  {categoryIds.length === 0
                    ? 'Todas las categorías'
                    : `${categoryIds.length} categoría${categoryIds.length > 1 ? 's' : ''}`}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0 text-gray-400" />
              </button>
              {categoryDropdownOpen && (
                <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={categoryIds.includes(cat.id)}
                        onChange={() => onToggleCategory(cat.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                      <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="filter-min-amount" className="text-xs">
                Monto mínimo
              </Label>
              <Input
                id="filter-min-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={minAmount}
                onChange={(e) => onMinAmountChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="filter-max-amount" className="text-xs">
                Monto máximo
              </Label>
              <Input
                id="filter-max-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={maxAmount}
                onChange={(e) => onMaxAmountChange(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>
        {/* fin bloque colapsable */}

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
              >
                {chip.icon && <CategoryIcon icon={chip.icon} color={chip.color} size="sm" />}
                {chip.label}
                <button
                  type="button"
                  onClick={chip.onRemove}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-blue-200"
                  aria-label={`Eliminar filtro ${chip.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
