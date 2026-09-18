import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from '../../../components/ui/dialog';
import { ConfirmDialog } from '../../../components/ui/confirm-dialog';
import { Badge } from '../../../components/ui/badge';
import { CategoryIcon } from '../../../components/ui/category-icon';
import { Select } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { formatCurrency, formatShortDate } from '../../../lib/utils';
import { transactionsApi, groupTransactionsByCategory } from '../../../features/transactions';
import type { Transaction, CreditCardStatement, CreditCardOverduePeriod } from '../../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { List, Grid3x3, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface CreditCardTransactionsModalProps {
  open: boolean;
  statement: CreditCardStatement | null;
  overduePeriod?: CreditCardOverduePeriod | null;
  onClose: () => void;
  onAddExpenseClick: (statement: CreditCardStatement) => void;
}

type PeriodFilter = 'all' | 'current' | 'closed' | 'overdue';

export function CreditCardTransactionsModal({
  open,
  statement,
  overduePeriod = null,
  onClose,
  onAddExpenseClick,
}: CreditCardTransactionsModalProps) {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const accountId = statement?.account.id;

  const loadTransactions = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const response = await transactionsApi.getAll({
        accountId,
        type: 'expense',
        limit: 1000,
      });
      setAllTransactions(response.transactions);
    } catch (err) {
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (!open || !accountId) return;
    loadTransactions();
  }, [open, accountId, loadTransactions]);

  // Al abrir el modal para un período vencido específico, preseleccionar su
  // pestaña en vez de "Todas" — es el punto de entrada desde
  // CreditCardOverduePeriodItem ("Ver transacciones").
  useEffect(() => {
    if (!open) return;
    setPeriodFilter(overduePeriod ? 'overdue' : 'all');
  }, [open, overduePeriod]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await transactionsApi.delete(deleteId);
      setDeleteId(null);
      await loadTransactions();
    } catch {
      toast.error('No se pudo eliminar la transacción');
    } finally {
      setDeleting(false);
    }
  };

  // Get unique categories from transactions
  const categories = useMemo(() => {
    const uniqueCategories = new Map<
      string,
      { id: string; name: string; icon?: string; color?: string }
    >();
    allTransactions.forEach((tx) => {
      if (tx.category && !uniqueCategories.has(tx.category.id)) {
        uniqueCategories.set(tx.category.id, tx.category);
      }
    });
    return Array.from(uniqueCategories.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allTransactions]);

  // Filter transactions by period and category
  const filteredTransactions = useMemo(() => {
    if (!statement) return [];

    let filtered = [...allTransactions];

    // Filter by period
    if (periodFilter === 'current') {
      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.date);
        return (
          txDate >= new Date(statement.currentPeriod.startDate) &&
          txDate <= new Date(statement.currentPeriod.endDate)
        );
      });
    } else if (periodFilter === 'closed') {
      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.date);
        return (
          txDate >= new Date(statement.closedPeriod.startDate) &&
          txDate <= new Date(statement.closedPeriod.endDate)
        );
      });
    } else if (periodFilter === 'overdue' && overduePeriod) {
      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.date);
        return (
          txDate >= new Date(overduePeriod.startDate) && txDate <= new Date(overduePeriod.endDate)
        );
      });
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((tx) => tx.categoryId === categoryFilter);
    }

    return filtered;
  }, [allTransactions, periodFilter, categoryFilter, statement, overduePeriod]);

  // Group transactions by category if enabled
  const groupedTransactions = useMemo(() => {
    if (!groupByCategory) return [];
    return groupTransactionsByCategory(filteredTransactions);
  }, [filteredTransactions, groupByCategory]);

  if (!statement) return null;

  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span>Transacciones - {statement.account.name}</span>
        </DialogTitle>
      </DialogHeader>

      <DialogContent className="max-h-[70vh] overflow-y-auto">
        {/* Period filter tabs */}
        <div className="space-y-3 mb-4 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setPeriodFilter('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  periodFilter === 'all'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setPeriodFilter('current')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  periodFilter === 'current'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Período Actual
              </button>
              <button
                onClick={() => setPeriodFilter('closed')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  periodFilter === 'closed'
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Período Cerrado
              </button>
              {overduePeriod && (
                <button
                  onClick={() => setPeriodFilter('overdue')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    periodFilter === 'overdue'
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Período Vencido ({formatShortDate(overduePeriod.startDate)} -{' '}
                  {formatShortDate(overduePeriod.endDate)})
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onAddExpenseClick(statement)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar gasto
              </Button>

              {/* Group toggle */}
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
          </div>

          {/* Category filter - only show when not grouping */}
          {!groupByCategory && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Filtrar por categoría:
              </label>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredTransactions.length} transacción
              {filteredTransactions.length !== 1 ? 'es' : ''}
            </span>
            <div className="text-right">
              <span className="text-xs text-gray-500 block">Total gastado</span>
              <span className="text-lg font-bold text-red-600">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Transactions list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 motion-safe:animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {categoryFilter !== 'all'
                ? 'No hay transacciones para esta categoría'
                : 'No hay transacciones en este período'}
            </p>
          </div>
        ) : groupByCategory ? (
          // Grouped view
          <div className="space-y-3">
            {groupedTransactions.map((group) => (
              <div
                key={group.category.id}
                className="rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Group header */}
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

                {/* Transactions in group */}
                <div className="divide-y divide-gray-100">
                  {group.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate text-sm">
                            {transaction.description || transaction.category?.name}
                          </p>
                          {transaction.fixedExpenseId && (
                            <Badge variant="secondary" className="text-xs">
                              Fijo
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {format(new Date(transaction.date), "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="font-semibold text-red-600 text-sm">
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeleteId(transaction.id)}
                        className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        aria-label="Eliminar transacción"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List view
          <div className="space-y-2">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {/* Category icon */}
                <div className="flex-shrink-0">
                  <CategoryIcon
                    icon={transaction.category?.icon}
                    color={transaction.category?.color}
                    size="md"
                  />
                </div>

                {/* Transaction info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">
                      {transaction.description || transaction.category?.name}
                    </p>
                    {transaction.fixedExpenseId && (
                      <Badge variant="secondary" className="text-xs">
                        Fijo
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">{transaction.category?.name}</p>
                    <span className="text-xs text-gray-400">•</span>
                    <p className="text-xs text-gray-500">
                      {format(new Date(transaction.date), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex-shrink-0 text-right">
                  <p className="font-semibold text-red-600">{formatCurrency(transaction.amount)}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setDeleteId(transaction.id)}
                  className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  aria-label="Eliminar transacción"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar transacción"
        loading={deleting}
      />
    </Dialog>
  );
}
