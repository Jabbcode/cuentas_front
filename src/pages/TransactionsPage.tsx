import { useEffect, useState, useCallback, useMemo } from 'react';
import { Plus, ArrowUpCircle, ArrowDownCircle, Trash2, ArrowLeftRight, CreditCard, AlertTriangle, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../components/ui/dialog';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { CategoryIconBadge } from '../components/ui/category-icon';
import { CategorySelect } from '../components/ui/category-select';
import { transactionsApi } from '../api/transactions.api';
import { accountsApi } from '../api/accounts.api';
import { categoriesApi } from '../api/categories.api';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import type { Transaction, Account, Category } from '../types';

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filtros
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [groupByCategory, setGroupByCategory] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const getInitialFormData = useCallback(() => ({
    amount: '',
    type: 'expense' as 'expense' | 'income',
    description: '',
    date: new Date().toISOString().split('T')[0],
    accountId: accounts.length > 0 ? accounts[0].id : '',
    categoryId: categories.find((c) => c.type === 'expense')?.id || '',
  }), [accounts, categories]);

  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'expense' | 'income',
    description: '',
    date: new Date().toISOString().split('T')[0],
    accountId: '',
    categoryId: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Construir filtros
      const filters: any = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      };

      // Filtro por fechas
      if (filterStartDate) {
        const startDate = new Date(filterStartDate);
        startDate.setHours(0, 0, 0, 0);
        filters.startDate = startDate.toISOString();

        // Si hay fecha inicio pero no fecha final, usar fecha actual como final
        if (!filterEndDate) {
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          filters.endDate = today.toISOString();
        }
      }

      if (filterEndDate) {
        const endDate = new Date(filterEndDate);
        endDate.setHours(23, 59, 59, 999);
        filters.endDate = endDate.toISOString();
      }

      // Filtro por categoría
      if (filterCategory !== 'all') {
        filters.categoryId = filterCategory;
      }

      // Filtro por tipo
      if (filterType !== 'all') {
        filters.type = filterType;
      }

      const [txData, accData, catData] = await Promise.all([
        transactionsApi.getAll(filters),
        accountsApi.getAll(),
        categoriesApi.getAll(),
      ]);

      setTransactions(txData.transactions);
      setTotal(txData.total);
      setAccounts(accData);
      setCategories(catData);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStartDate, filterEndDate, filterCategory, filterType]);

  // Helper to get credit card period for a transaction
  const getCreditCardPeriod = (tx: Transaction) => {
    const account = accounts.find((acc) => acc.id === tx.accountId);
    if (!account || account.type !== 'credit_card' || !account.cutoffDay) return null;

    const txDate = new Date(tx.date);
    const cutoffDay = account.cutoffDay;
    const txDay = txDate.getDate();
    const txMonth = txDate.getMonth();
    const txYear = txDate.getFullYear();

    let periodStart: Date;
    let periodEnd: Date;

    if (txDay >= cutoffDay) {
      // Transaction is in current period
      periodStart = new Date(txYear, txMonth, cutoffDay);
      periodEnd = new Date(txYear, txMonth + 1, cutoffDay - 1);
    } else {
      // Transaction is in previous period
      periodStart = new Date(txYear, txMonth - 1, cutoffDay);
      periodEnd = new Date(txYear, txMonth, cutoffDay - 1);
    }

    return {
      start: periodStart,
      end: periodEnd,
      label: `${periodStart.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - ${periodEnd.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`,
    };
  };

  // Check if selected date is in a closed period for credit card
  const dateWarning = useMemo(() => {
    if (!formData.accountId || !formData.date || formData.type !== 'expense') return null;

    const account = accounts.find((acc) => acc.id === formData.accountId);
    if (!account || account.type !== 'credit_card' || !account.cutoffDay) return null;

    const selectedDate = new Date(formData.date);
    const today = new Date();
    const cutoffDay = account.cutoffDay;

    // Calculate last cutoff date
    let lastCutoff: Date;
    if (today.getDate() >= cutoffDay) {
      lastCutoff = new Date(today.getFullYear(), today.getMonth(), cutoffDay);
    } else {
      lastCutoff = new Date(today.getFullYear(), today.getMonth() - 1, cutoffDay);
    }

    // If selected date is before last cutoff, it's in a closed period
    if (selectedDate < lastCutoff) {
      return {
        type: 'error' as const,
        message: `Esta fecha pertenece a un período ya cerrado (antes del ${lastCutoff.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}). Los cargos deberían ir al período actual.`,
      };
    }

    return null;
  }, [formData.accountId, formData.date, formData.type, accounts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Agrupar transacciones por categoría
  const groupedTransactions = useMemo(() => {
    if (!groupByCategory) return null;

    const groups = new Map<string, {
      category: Pick<Category, 'id' | 'name' | 'icon' | 'color'>;
      transactions: Transaction[];
      total: number
    }>();

    transactions.forEach((tx) => {
      if (!tx.category) return;

      const key = tx.category.id;
      if (!groups.has(key)) {
        groups.set(key, {
          category: tx.category,
          transactions: [],
          total: 0,
        });
      }

      const group = groups.get(key)!;
      group.transactions.push(tx);
      group.total += Number(tx.amount) * (tx.type === 'income' ? 1 : -1);
    });

    return Array.from(groups.values()).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  }, [transactions, groupByCategory]);

  // Cálculos de paginación
  const totalPages = Math.ceil(total / itemsPerPage);
  const startItem = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, total);

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  // Handlers para filtros (resetear a página 1)
  const handleStartDateChange = (date: string) => {
    setFilterStartDate(date);
    setCurrentPage(1);
  };

  const handleEndDateChange = (date: string) => {
    setFilterEndDate(date);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (categoryId: string) => {
    setFilterCategory(categoryId);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (type: 'all' | 'expense' | 'income') => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterCategory('all');
    setFilterType('all');
    setCurrentPage(1);
  };

  const handleTypeChange = (type: 'expense' | 'income') => {
    const defaultCat = categories.find((c) => c.type === type);
    setFormData((prev) => ({
      ...prev,
      type,
      categoryId: defaultCat?.id || '',
    }));
  };

  const handleOpenForm = () => {
    // Resetear formulario con valores por defecto al abrir
    setFormData(getInitialFormData());
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    // Resetear formulario al cerrar
    setFormData(getInitialFormData());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transactionsApi.create({
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description || undefined,
        date: new Date(formData.date).toISOString(),
        accountId: formData.accountId,
        categoryId: formData.categoryId,
      });
      handleCloseForm();
      loadData();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await transactionsApi.delete(deleteId);
      setDeleteId(null);
      loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transacciones</h1>
          <p className="text-gray-500">
            {total} {total === 1 ? 'transacción' : 'transacciones'}
          </p>
        </div>
        <Button onClick={handleOpenForm}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Transacción
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros</span>
            </div>
            {(filterStartDate || filterEndDate || filterCategory !== 'all' || filterType !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Filtro por fecha desde */}
            <div>
              <Label htmlFor="filter-start-date" className="text-xs">Desde</Label>
              <Input
                id="filter-start-date"
                type="date"
                value={filterStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Filtro por fecha hasta */}
            <div>
              <Label htmlFor="filter-end-date" className="text-xs">Hasta</Label>
              <Input
                id="filter-end-date"
                type="date"
                value={filterEndDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Filtro por categoría */}
            <div>
              <Label htmlFor="filter-category" className="text-xs">Categoría</Label>
              <Select
                id="filter-category"
                value={filterCategory}
                onChange={(e) => handleCategoryFilterChange(e.target.value)}
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
              <Label htmlFor="filter-type" className="text-xs">Tipo</Label>
              <Select
                id="filter-type"
                value={filterType}
                onChange={(e) => handleTypeFilterChange(e.target.value as 'all' | 'expense' | 'income')}
                className="mt-1"
              >
                <option value="all">Todos</option>
                <option value="expense">Gastos</option>
                <option value="income">Ingresos</option>
              </Select>
            </div>

            {/* Agrupar por categoría */}
            <div>
              <Label htmlFor="group-category" className="text-xs">Vista</Label>
              <Select
                id="group-category"
                value={groupByCategory ? 'grouped' : 'list'}
                onChange={(e) => setGroupByCategory(e.target.value === 'grouped')}
                className="mt-1"
              >
                <option value="list">Lista</option>
                <option value="grouped">Agrupada</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transacciones - Vista Lista */}
      {!groupByCategory && (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const creditCardPeriod = getCreditCardPeriod(tx);
            const isCreditCard = accounts.find((acc) => acc.id === tx.accountId)?.type === 'credit_card';

            return (
              <Card key={tx.id} className="transition-all hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <CategoryIconBadge
                      icon={tx.category?.icon}
                      color={tx.category?.color}
                      size="lg"
                      tooltip={tx.category?.name}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">
                          {tx.category?.name}
                        </span>
                        {tx.fixedExpenseId && (
                          <Badge variant="secondary">Fijo</Badge>
                        )}
                        {isCreditCard && tx.type === 'expense' && creditCardPeriod && (
                          <Badge variant="outline" className="text-xs">
                            <CreditCard className="mr-1 h-3 w-3" />
                            {creditCardPeriod.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {tx.description || tx.account?.name} • {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        'text-lg font-bold',
                        tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(Number(tx.amount))}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(tx.id)}
                      className="h-8 w-8 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {transactions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <ArrowLeftRight className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">No se encontraron transacciones con los filtros seleccionados.</p>
                <Button onClick={handleOpenForm} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Crear transacción
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Transacciones - Vista Agrupada */}
      {groupByCategory && groupedTransactions && (
        <div className="space-y-4">
          {groupedTransactions.map((group) => (
            <Card key={group.category.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b">
                  <div className="flex items-center gap-3">
                    <CategoryIconBadge
                      icon={group.category.icon}
                      color={group.category.color}
                      size="lg"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{group.category.name}</h3>
                      <p className="text-sm text-gray-500">{group.transactions.length} transacciones</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-xl font-bold',
                      group.total >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {group.total >= 0 ? '+' : ''}
                    {formatCurrency(Math.abs(group.total))}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.transactions.map((tx) => {
                    const creditCardPeriod = getCreditCardPeriod(tx);
                    const isCreditCard = accounts.find((acc) => acc.id === tx.accountId)?.type === 'credit_card';

                    return (
                      <div key={tx.id} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {tx.description || tx.account?.name}
                            </span>
                            {tx.fixedExpenseId && (
                              <Badge variant="secondary" className="text-xs">Fijo</Badge>
                            )}
                            {isCreditCard && tx.type === 'expense' && creditCardPeriod && (
                              <Badge variant="outline" className="text-xs">
                                <CreditCard className="mr-1 h-3 w-3" />
                                {creditCardPeriod.label}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'font-bold',
                              tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                            )}
                          >
                            {tx.type === 'income' ? '+' : '-'}
                            {formatCurrency(Number(tx.amount))}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(tx.id)}
                            className="h-6 w-6 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {groupedTransactions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <ArrowLeftRight className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">No se encontraron transacciones con los filtros seleccionados.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Paginación */}
      {total > itemsPerPage && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {startItem}-{endItem} de {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onClose={handleCloseForm}>
        <DialogHeader>
          <DialogTitle>Nueva Transacción</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogContent className="space-y-4">
            <div>
              <Label>Tipo</Label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={formData.type === 'expense' ? 'destructive' : 'outline'}
                  className="w-full"
                  onClick={() => handleTypeChange('expense')}
                >
                  <ArrowDownCircle className="mr-2 h-4 w-4" />
                  Gasto
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'income' ? 'success' : 'outline'}
                  className="w-full"
                  onClick={() => handleTypeChange('income')}
                >
                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                  Ingreso
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="account">Cuenta</Label>
              <Select
                id="account"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                required
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Categoría</Label>
              <CategorySelect
                categories={filteredCategories}
                value={formData.categoryId}
                onChange={(categoryId) => setFormData({ ...formData, categoryId })}
                required
              />
            </div>

            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
              {dateWarning && (
                <div className={`mt-2 rounded-lg border p-3 flex items-start gap-2 ${
                  dateWarning.type === 'error'
                    ? 'border-red-200 bg-red-50'
                    : 'border-orange-200 bg-orange-50'
                }`}>
                  <AlertTriangle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                    dateWarning.type === 'error' ? 'text-red-600' : 'text-orange-600'
                  }`} />
                  <p className={`text-xs ${
                    dateWarning.type === 'error' ? 'text-red-800' : 'text-orange-800'
                  }`}>
                    {dateWarning.message}
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input
                id="description"
                placeholder="Notas..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </DialogContent>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button type="submit">Crear</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar transacción"
        description="¿Estás seguro de eliminar esta transacción? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
