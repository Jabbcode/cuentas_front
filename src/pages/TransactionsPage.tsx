import { Plus, Camera, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ErrorCard } from '../components/ui/ErrorCard';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { ReceiptItemsModal } from '../components/receipts/ReceiptItemsModal';
import { useTransactionsPage } from '../features/transactions/hooks/useTransactionsPage';
import {
  TransactionFilters,
  TransactionList,
  TransactionPagination,
  EditTransactionModal,
  ReceiptScanner,
} from '../features/transactions';
import { TransactionFormDialog } from '../features/transactions/components/TransactionFormDialog';
import { TransactionCategorySummaryModal } from '../features/transactions/components/TransactionCategorySummaryModal';

export function TransactionsPage() {
  const page = useTransactionsPage();

  if (page.loading && page.transactions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 motion-safe:animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (page.loadError) {
    return <ErrorCard message={page.loadError} onRetry={page.reload} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transacciones</h1>
          <p className="text-gray-600">
            {page.total} {page.total === 1 ? 'transacción' : 'transacciones'}
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
          <Button
            variant="outline"
            onClick={() => page.setShowCategorySummary(true)}
            className="w-full md:w-auto"
          >
            <BarChart3 className="mr-2 h-4 w-4" /> Resumen por categoría
          </Button>
          <Button
            variant="outline"
            onClick={() => page.setShowScanner(true)}
            className="w-full md:w-auto"
          >
            <Camera className="mr-2 h-4 w-4" /> Escanear Factura
          </Button>
          <Button onClick={page.handleOpenForm} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Nueva Transacción
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TransactionFilters
        startDate={page.filters.startDate}
        endDate={page.filters.endDate}
        categoryIds={page.filters.categoryIds}
        accountId={page.filters.accountId}
        minAmount={page.filters.minAmount}
        maxAmount={page.filters.maxAmount}
        type={page.filters.type}
        categories={page.categories}
        accounts={page.accounts}
        hasActiveFilters={page.hasActiveFilters}
        onStartDateChange={page.setStartDate}
        onEndDateChange={page.setEndDate}
        onToggleCategory={page.toggleCategory}
        onRemoveCategory={page.removeCategory}
        onAccountChange={page.setAccountId}
        onMinAmountChange={page.setMinAmount}
        onMaxAmountChange={page.setMaxAmount}
        onTypeChange={page.setType}
        onClearFilters={page.clearFilters}
      />

      {/* Transactions list */}
      <TransactionList
        transactions={page.filteredTransactions}
        accounts={page.accounts}
        onDelete={page.setDeleteId}
        onEdit={page.handleEdit}
        onViewItems={page.handleViewItems}
        loadingItemsId={page.loadingItemsId}
        onCreateClick={page.handleOpenForm}
      />

      {/* Pagination */}
      {page.total > page.itemsPerPage &&
        (page.filteredTransactions.length >= page.itemsPerPage || page.currentPage > 1) && (
          <TransactionPagination
            currentPage={page.currentPage}
            totalPages={page.paginationInfo.totalPages}
            startItem={page.paginationInfo.startItem}
            endItem={page.paginationInfo.endItem}
            total={page.total}
            onPreviousPage={page.previousPage}
            onNextPage={page.nextPage}
            hasNextPage={page.paginationInfo.hasNextPage}
            hasPreviousPage={page.paginationInfo.hasPreviousPage}
          />
        )}

      {/* Create Transaction Form Dialog */}
      <TransactionFormDialog
        open={page.showForm}
        onClose={page.handleCloseForm}
        formData={page.formData}
        filteredCategories={page.filteredCategories}
        accounts={page.accounts}
        dateWarning={page.dateWarning}
        saving={page.saving}
        onTypeChange={page.handleTypeChange}
        onFormDataChange={page.handleFormDataChange}
        onSubmit={page.handleSubmit}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!page.deleteId}
        onClose={() => page.setDeleteId(null)}
        onConfirm={page.handleDelete}
        title="Eliminar transacción"
        description="¿Estás seguro de eliminar esta transacción? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={page.deleting}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        open={!!page.editingTransaction}
        transaction={page.editingTransaction}
        categories={page.categories}
        account={
          page.editingTransaction
            ? (page.accounts.find((a) => a.id === page.editingTransaction!.accountId) ?? null)
            : null
        }
        onClose={() => page.setEditingTransaction(null)}
        onSave={page.handleSaveEdit}
      />

      {/* Category Summary Modal */}
      <TransactionCategorySummaryModal
        open={page.showCategorySummary}
        summary={page.categorySummary}
        loading={page.categorySummaryLoading}
        onClose={() => page.setShowCategorySummary(false)}
        onCategoryClick={(categoryId) => page.toggleCategory(categoryId)}
      />

      {/* Receipt Scanner */}
      <ReceiptScanner
        open={page.showScanner}
        onClose={() => page.setShowScanner(false)}
        onScanned={page.handleScannedReceipt}
      />

      {/* Receipt Items Modal */}
      {page.viewingItems && page.viewingItems.receiptItems && (
        <ReceiptItemsModal
          open={!page.loadingItemsId}
          onClose={() => page.setViewingItems(null)}
          items={page.viewingItems.receiptItems}
          transactionAmount={Number(page.viewingItems.amount)}
        />
      )}
    </div>
  );
}
