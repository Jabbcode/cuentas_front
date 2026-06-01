import { useState, useEffect, useMemo, useRef } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { CategoryIcon } from '../../../components/ui/category-icon';
import { Button } from '../../../components/ui/button';
import { formatCurrency, cn } from '../../../lib/utils';
import { transactionsApi, groupTransactionsByCategory } from '../../transactions';
import type { Transaction, Account } from '../../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { List, Grid3x3, ChevronDown, Check } from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface CategoryFilterSelectProps {
  categories: CategoryOption[];
  value: string;
  onChange: (value: string) => void;
}

function CategoryFilterSelect({ categories, value, onChange }: CategoryFilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = categories.find((c) => c.id === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors',
          'hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200',
          isOpen && 'border-blue-500 ring-2 ring-blue-200'
        )}
      >
        {selected ? (
          <div className="flex items-center gap-2">
            <CategoryIcon icon={selected.icon} color={selected.color} size="sm" />
            <span className="text-gray-900">{selected.name}</span>
          </div>
        ) : (
          <span className="text-gray-500">Todas las categorías</span>
        )}
        <ChevronDown
          className={cn('h-4 w-4 text-gray-400 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          <div className="max-h-52 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange('all');
                setIsOpen(false);
              }}
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-gray-100',
                value === 'all' && 'bg-blue-50'
              )}
            >
              <span className="text-gray-500">Todas las categorías</span>
              {value === 'all' && <Check className="h-4 w-4 text-blue-600" />}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onChange(cat.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-gray-100',
                  value === cat.id && 'bg-blue-50'
                )}
              >
                <div className="flex items-center gap-2">
                  <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />
                  <span className="text-gray-900">{cat.name}</span>
                </div>
                {value === cat.id && <Check className="h-4 w-4 text-blue-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface AccountTransactionsModalProps {
  open: boolean;
  account: Account | null;
  onClose: () => void;
}

export function AccountTransactionsModal({
  open,
  account,
  onClose,
}: AccountTransactionsModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [groupByCategory, setGroupByCategory] = useState(false);

  useEffect(() => {
    if (!open || !account) return;
    let cancelled = false;
    setTransactions([]);
    setCategoryFilter('all');
    setTypeFilter('all');
    setGroupByCategory(false);
    const load = async () => {
      setLoading(true);
      try {
        const response = await transactionsApi.getAll({ accountId: account.id, limit: 1000 });
        if (!cancelled) setTransactions(response.transactions);
      } catch (err) {
        console.error('Error loading transactions:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, account]);

  const categories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; icon?: string; color?: string }>();
    transactions.forEach((tx) => {
      if (tx.category && !map.has(tx.category.id)) map.set(tx.category.id, tx.category);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [transactions]);

  const filtered = useMemo(() => {
    let result = [...transactions];
    if (typeFilter !== 'all') result = result.filter((tx) => tx.type === typeFilter);
    if (categoryFilter !== 'all') result = result.filter((tx) => tx.categoryId === categoryFilter);
    return result;
  }, [transactions, typeFilter, categoryFilter]);

  const grouped = useMemo(() => {
    if (!groupByCategory) return [];
    return groupTransactionsByCategory(filtered);
  }, [filtered, groupByCategory]);

  const total = useMemo(
    () =>
      filtered.reduce((sum, tx) => sum + (tx.type === 'income' ? 1 : -1) * Number(tx.amount), 0),
    [filtered]
  );

  if (!account) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Transacciones — {account.name}</DialogTitle>
      </DialogHeader>

      <DialogContent className="max-h-[70vh] overflow-y-auto">
        {/* Filters */}
        <div className="space-y-3 mb-4 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {(['all', 'expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    typeFilter === t
                      ? t === 'expense'
                        ? 'bg-red-100 text-red-700'
                        : t === 'income'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t === 'all' ? 'Todas' : t === 'expense' ? 'Gastos' : 'Ingresos'}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setGroupByCategory(!groupByCategory)}
              className={groupByCategory ? 'bg-purple-50 border-purple-200' : ''}
            >
              {groupByCategory ? (
                <>
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Agrupado
                </>
              ) : (
                <>
                  <List className="h-4 w-4 mr-2" />
                  Lista
                </>
              )}
            </Button>
          </div>

          {!groupByCategory && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Categoría:
              </label>
              <CategoryFilterSelect
                categories={categories}
                value={categoryFilter}
                onChange={setCategoryFilter}
              />
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {filtered.length} transacción{filtered.length !== 1 ? 'es' : ''}
          </span>
          <div className="text-right">
            <span className="text-xs text-gray-500 block">Neto</span>
            <span
              className={cn('text-lg font-bold', total >= 0 ? 'text-green-600' : 'text-red-600')}
            >
              {formatCurrency(Math.abs(total))}
            </span>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay transacciones para mostrar</p>
          </div>
        ) : groupByCategory ? (
          <div className="space-y-3">
            {grouped.map((group) => (
              <div
                key={group.category.id}
                className="rounded-lg border border-gray-200 overflow-hidden"
              >
                <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                  <div className="flex items-center gap-3">
                    <CategoryIcon
                      icon={group.category.icon}
                      color={group.category.color}
                      size="md"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{group.category.name}</h4>
                      <p className="text-xs text-gray-500">
                        {group.transactions.length} transacción
                        {group.transactions.length !== 1 ? 'es' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-base font-bold text-red-600">
                    {formatCurrency(Math.abs(group.total))}
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {group.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate text-sm">
                            {tx.description || tx.category?.name}
                          </p>
                          {tx.fixedExpenseId && (
                            <Badge variant="secondary" className="text-xs">
                              Fijo
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {format(new Date(tx.date), "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                      </div>
                      <p
                        className={cn(
                          'font-semibold text-sm flex-shrink-0',
                          tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <CategoryIcon icon={tx.category?.icon} color={tx.category?.color} size="md" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">
                      {tx.description || tx.category?.name}
                    </p>
                    {tx.fixedExpenseId && (
                      <Badge variant="secondary" className="text-xs">
                        Fijo
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">{tx.category?.name}</p>
                    <span className="text-xs text-gray-400">•</span>
                    <p className="text-xs text-gray-500">
                      {format(new Date(tx.date), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
                <p
                  className={cn(
                    'font-semibold flex-shrink-0',
                    tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
