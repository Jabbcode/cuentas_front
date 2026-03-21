import { useState, useCallback, useMemo } from 'react';
import { Plus, ArrowUpCircle, ArrowDownCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../components/ui/dialog';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { CategorySelect } from '../components/ui/category-select';
import { TransactionFilters } from '../components/transactions/TransactionFilters';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionGroupedView } from '../components/transactions/TransactionGroupedView';
import { TransactionPagination } from '../components/transactions/TransactionPagination';
import { useTransactions } from '../hooks/useTransactions';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import { usePagination } from '../hooks/usePagination';
import { groupTransactionsByCategory } from '../lib/transaction-utils';
import { getClosedPeriodWarning } from '../lib/credit-card-utils';
import { transactionsApi } from '../api/transactions.api';

export function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Paginación
  const pagination = usePagination(20);

  // Filtros
  const transactionFilters = useTransactionFilters(pagination.resetPage);

  // Datos de transacciones
  const { transactions, total, accounts, categories, loading, reload } = useTransactions({
    currentPage: pagination.currentPage,
    itemsPerPage: pagination.itemsPerPage,
    startDate: transactionFilters.filters.startDate,
    endDate: transactionFilters.filters.endDate,
    categoryId: transactionFilters.filters.categoryId,
    type: transactionFilters.filters.type,
  });

  // Form state
  const getInitialFormData = useCallback(
    () => ({
      amount: '',
      type: 'expense' as 'expense' | 'income',
      description: '',
      date: new Date().toISOString().split('T')[0],
      accountId: accounts.length > 0 ? accounts[0].id : '',
      categoryId: categories.find((c) => c.type === 'expense')?.id || '',
    }),
    [accounts, categories]
  );

  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'expense' | 'income',
    description: '',
    date: new Date().toISOString().split('T')[0],
    accountId: '',
    categoryId: '',
  });

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  // Grouped transactions
  const groupedTransactions = useMemo(() => {
    if (!transactionFilters.filters.groupByCategory) return null;
    return groupTransactionsByCategory(transactions);
  }, [transactions, transactionFilters.filters.groupByCategory]);

  // Pagination info
  const paginationInfo = pagination.getPaginationInfo(total);

  // Date warning for credit card closed periods
  const dateWarning = useMemo(() => {
    if (!formData.accountId || !formData.date || formData.type !== 'expense') return null;
    const account = accounts.find((acc) => acc.id === formData.accountId);
    return getClosedPeriodWarning(formData.date, account);
  }, [formData.accountId, formData.date, formData.type, accounts]);

  // Handlers
  const handleTypeChange = (type: 'expense' | 'income') => {
    const defaultCat = categories.find((c) => c.type === type);
    setFormData((prev) => ({
      ...prev,
      type,
      categoryId: defaultCat?.id || '',
    }));
  };

  const handleOpenForm = () => {
    setFormData(getInitialFormData());
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
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
      reload();
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
      reload();
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
      {/* Header */}
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

      {/* Filters */}
      <TransactionFilters
        startDate={transactionFilters.filters.startDate}
        endDate={transactionFilters.filters.endDate}
        categoryId={transactionFilters.filters.categoryId}
        type={transactionFilters.filters.type}
        groupByCategory={transactionFilters.filters.groupByCategory}
        categories={categories}
        hasActiveFilters={transactionFilters.hasActiveFilters}
        onStartDateChange={transactionFilters.setStartDate}
        onEndDateChange={transactionFilters.setEndDate}
        onCategoryChange={transactionFilters.setCategoryId}
        onTypeChange={transactionFilters.setType}
        onGroupByCategoryChange={transactionFilters.setGroupByCategory}
        onClearFilters={transactionFilters.clearFilters}
      />

      {/* Transactions - List or Grouped View */}
      {!transactionFilters.filters.groupByCategory ? (
        <TransactionList
          transactions={transactions}
          accounts={accounts}
          onDelete={setDeleteId}
          onCreateClick={handleOpenForm}
        />
      ) : (
        groupedTransactions && (
          <TransactionGroupedView
            groupedTransactions={groupedTransactions}
            accounts={accounts}
            onDelete={setDeleteId}
            onCreateClick={handleOpenForm}
          />
        )
      )}

      {/* Pagination */}
      {total > pagination.itemsPerPage && (
        <TransactionPagination
          currentPage={pagination.currentPage}
          totalPages={paginationInfo.totalPages}
          startItem={paginationInfo.startItem}
          endItem={paginationInfo.endItem}
          total={total}
          onPreviousPage={pagination.previousPage}
          onNextPage={pagination.nextPage}
          hasNextPage={paginationInfo.hasNextPage}
          hasPreviousPage={paginationInfo.hasPreviousPage}
        />
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
              <select
                id="account"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                required
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
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
                <div
                  className={`mt-2 rounded-lg border p-3 flex items-start gap-2 ${
                    dateWarning.type === 'error'
                      ? 'border-red-200 bg-red-50'
                      : 'border-orange-200 bg-orange-50'
                  }`}
                >
                  <AlertTriangle
                    className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                      dateWarning.type === 'error' ? 'text-red-600' : 'text-orange-600'
                    }`}
                  />
                  <p
                    className={`text-xs ${
                      dateWarning.type === 'error' ? 'text-red-800' : 'text-orange-800'
                    }`}
                  >
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
