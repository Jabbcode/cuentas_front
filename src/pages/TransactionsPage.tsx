import { useState, useCallback, useMemo } from 'react';
import { Plus, ArrowUpCircle, ArrowDownCircle, AlertTriangle, Camera, Tag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { TagInput } from '../components/transactions/TagInput';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '../components/ui/dialog';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { CategorySelect } from '../components/ui/category-select';
import { TransactionFilters } from '../components/transactions/TransactionFilters';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionGroupedView } from '../components/transactions/TransactionGroupedView';
import { TransactionPagination } from '../components/transactions/TransactionPagination';
import { EditTransactionModal } from '../components/transactions/EditTransactionModal';
import { ReceiptScanner } from '../components/transactions/ReceiptScanner';
import { ReceiptItemsModal } from '../components/receipts/ReceiptItemsModal';
import { TagSummaryView } from '../components/transactions/TagSummaryView';
import { useTransactions } from '../hooks/useTransactions';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import { usePagination } from '../hooks/usePagination';
import { useTags, useTagsSummary } from '../hooks/useTags';
import { groupTransactionsByCategory } from '../lib/transaction-utils';
import { getClosedPeriodWarning } from '../lib/credit-card-utils';
import { transactionsApi } from '../api/transactions.api';
import type { Transaction } from '../types';
import type { ScanReceiptData } from '../api/receipts.api';

export function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showTagSummary, setShowTagSummary] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [viewingItems, setViewingItems] = useState<Transaction | null>(null);
  const [loadingItemsId, setLoadingItemsId] = useState<string | null>(null);

  // Paginación
  const pagination = usePagination(20);

  // Filtros
  const transactionFilters = useTransactionFilters(pagination.resetPage);

  // Tags disponibles
  const { tags: availableTags, reload: reloadTags } = useTags();
  const {
    summary: tagSummary,
    loading: tagSummaryLoading,
    reload: reloadTagSummary,
  } = useTagsSummary();

  // Datos de transacciones
  const { transactions, total, accounts, categories, loading, reload } = useTransactions({
    currentPage: pagination.currentPage,
    itemsPerPage: pagination.itemsPerPage,
    startDate: transactionFilters.filters.startDate,
    endDate: transactionFilters.filters.endDate,
    accountId:
      transactionFilters.filters.accountId !== 'all'
        ? transactionFilters.filters.accountId
        : undefined,
    type: transactionFilters.filters.type,
    tag: transactionFilters.filters.tag || undefined,
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
      imageHash: undefined as string | undefined,
      tagNames: [] as string[],
      receiptItems: [] as Array<{
        name: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }>,
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
    imageHash: '' as string | undefined,
    tagNames: [] as string[],
    receiptItems: [] as Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>,
  });

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  // Client-side filtering for categoryIds and amount range
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    if (transactionFilters.filters.categoryIds.length > 0) {
      result = result.filter(
        (tx) => tx.category && transactionFilters.filters.categoryIds.includes(tx.category.id)
      );
    }

    const min = parseFloat(transactionFilters.filters.minAmount);
    const max = parseFloat(transactionFilters.filters.maxAmount);
    if (!isNaN(min)) {
      result = result.filter((tx) => Number(tx.amount) >= min);
    }
    if (!isNaN(max)) {
      result = result.filter((tx) => Number(tx.amount) <= max);
    }

    return result;
  }, [
    transactions,
    transactionFilters.filters.categoryIds,
    transactionFilters.filters.minAmount,
    transactionFilters.filters.maxAmount,
  ]);

  // Grouped transactions
  const groupedTransactions = useMemo(() => {
    if (!transactionFilters.filters.groupByCategory) return null;
    return groupTransactionsByCategory(filteredTransactions);
  }, [filteredTransactions, transactionFilters.filters.groupByCategory]);

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

  const handleScannedReceipt = (scannedData: ScanReceiptData) => {
    // Find category by name if suggested
    let categoryId = formData.categoryId;
    if (scannedData.suggestedCategory) {
      const matchedCategory = categories.find(
        (c) =>
          c.type === 'expense' &&
          c.name.toLowerCase() === scannedData.suggestedCategory?.toLowerCase()
      );
      if (matchedCategory) {
        categoryId = matchedCategory.id;
      }
    }

    // Pre-fill form with scanned data
    setFormData({
      amount: scannedData.amount.toString(),
      type: 'expense',
      description: scannedData.description,
      date: scannedData.date,
      accountId: accounts.length > 0 ? accounts[0].id : '',
      categoryId,
      imageHash: scannedData.imageHash,
      receiptItems: scannedData.items || [],
    });

    // Open form
    setShowForm(true);
  };

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await transactionsApi.create({
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description || undefined,
        date: new Date(formData.date).toISOString(),
        accountId: formData.accountId,
        categoryId: formData.categoryId,
        imageHash: formData.imageHash || undefined,
        tagNames: formData.tagNames.length > 0 ? formData.tagNames : undefined,
        receiptItems: formData.receiptItems.length > 0 ? formData.receiptItems : undefined,
      });
      handleCloseForm();
      reloadTags();
      reloadTagSummary();
      reload();
    } catch (err) {
      console.error('Error creating transaction:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleViewItems = async (transaction: Transaction) => {
    // If items are already loaded, just show them
    if (transaction.receiptItems && transaction.receiptItems.length > 0) {
      setViewingItems(transaction);
      return;
    }

    // Otherwise, load items from API
    setLoadingItemsId(transaction.id);
    try {
      const items = await transactionsApi.getReceiptItems(transaction.id);
      setViewingItems({ ...transaction, receiptItems: items });
    } catch (error) {
      console.error('Error loading receipt items:', error);
    } finally {
      setLoadingItemsId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await transactionsApi.delete(deleteId);
      setDeleteId(null);
      reload();
    } catch (err) {
      console.error('Error deleting transaction:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleSaveEdit = async (
    id: string,
    data: {
      description?: string;
      categoryId: string;
      date: string;
      amount: string;
      tagNames: string[];
    }
  ) => {
    await transactionsApi.update(id, {
      description: data.description || undefined,
      categoryId: data.categoryId,
      date: new Date(data.date).toISOString(),
      amount: parseFloat(data.amount),
      tagNames: data.tagNames,
    });
    setEditingTransaction(null);
    reloadTags();
    reloadTagSummary();
    reload();
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
        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
          <Button
            variant={showTagSummary ? 'default' : 'outline'}
            onClick={() => setShowTagSummary((prev) => !prev)}
            className="w-full md:w-auto"
          >
            <Tag className="mr-2 h-4 w-4" /> {showTagSummary ? 'Ver lista' : 'Resumen por tags'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowScanner(true)}
            className="w-full md:w-auto"
          >
            <Camera className="mr-2 h-4 w-4" /> Escanear Factura
          </Button>
          <Button onClick={handleOpenForm} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Nueva Transacción
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TransactionFilters
        startDate={transactionFilters.filters.startDate}
        endDate={transactionFilters.filters.endDate}
        categoryIds={transactionFilters.filters.categoryIds}
        accountId={transactionFilters.filters.accountId}
        minAmount={transactionFilters.filters.minAmount}
        maxAmount={transactionFilters.filters.maxAmount}
        type={transactionFilters.filters.type}
        groupByCategory={transactionFilters.filters.groupByCategory}
        tag={transactionFilters.filters.tag}
        categories={categories}
        accounts={accounts}
        availableTags={availableTags}
        hasActiveFilters={transactionFilters.hasActiveFilters}
        onStartDateChange={transactionFilters.setStartDate}
        onEndDateChange={transactionFilters.setEndDate}
        onToggleCategory={transactionFilters.toggleCategory}
        onRemoveCategory={transactionFilters.removeCategory}
        onAccountChange={transactionFilters.setAccountId}
        onMinAmountChange={transactionFilters.setMinAmount}
        onMaxAmountChange={transactionFilters.setMaxAmount}
        onTypeChange={transactionFilters.setType}
        onGroupByCategoryChange={transactionFilters.setGroupByCategory}
        onTagChange={transactionFilters.setTag}
        onClearFilters={transactionFilters.clearFilters}
      />

      {/* Tag Summary View */}
      {showTagSummary && (
        <TagSummaryView
          summary={tagSummary}
          loading={tagSummaryLoading}
          onTagClick={(tagName) => {
            setShowTagSummary(false);
            transactionFilters.setTag(tagName);
          }}
          onDeleted={() => {
            reloadTags();
            reloadTagSummary();
            reload();
          }}
        />
      )}

      {/* Transactions - List or Grouped View */}
      {!showTagSummary && !transactionFilters.filters.groupByCategory ? (
        <TransactionList
          transactions={filteredTransactions}
          accounts={accounts}
          onDelete={setDeleteId}
          onEdit={handleEdit}
          onViewItems={handleViewItems}
          loadingItemsId={loadingItemsId}
          onCreateClick={handleOpenForm}
        />
      ) : !showTagSummary ? (
        groupedTransactions && (
          <TransactionGroupedView
            groupedTransactions={groupedTransactions}
            accounts={accounts}
            onDelete={setDeleteId}
            onEdit={handleEdit}
            onViewItems={handleViewItems}
            loadingItemsId={loadingItemsId}
            onCreateClick={handleOpenForm}
          />
        )
      ) : null}

      {/* Pagination */}
      {!showTagSummary &&
        total > pagination.itemsPerPage &&
        (filteredTransactions.length >= pagination.itemsPerPage || pagination.currentPage > 1) && (
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

            <div>
              <Label>Etiquetas (opcional)</Label>
              <TagInput
                value={formData.tagNames}
                onChange={(tagNames) => setFormData({ ...formData, tagNames })}
                suggestions={availableTags}
              />
            </div>
          </DialogContent>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Crear'}
            </Button>
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

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        open={!!editingTransaction}
        transaction={editingTransaction}
        categories={categories}
        account={
          editingTransaction
            ? accounts.find((a) => a.id === editingTransaction.accountId) || null
            : null
        }
        availableTags={availableTags}
        onClose={() => setEditingTransaction(null)}
        onSave={handleSaveEdit}
      />

      {/* Receipt Scanner */}
      <ReceiptScanner
        open={showScanner}
        onClose={() => setShowScanner(false)}
        onScanned={handleScannedReceipt}
      />

      {/* Receipt Items Modal */}
      {viewingItems && viewingItems.receiptItems && (
        <ReceiptItemsModal
          open={!loadingItemsId}
          onClose={() => setViewingItems(null)}
          items={viewingItems.receiptItems}
          transactionAmount={Number(viewingItems.amount)}
        />
      )}
    </div>
  );
}
