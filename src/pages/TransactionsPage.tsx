import { Plus, Camera, Tag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { ReceiptItemsModal } from '../components/receipts/ReceiptItemsModal';
import { useTransactionsPage } from '../features/transactions/hooks/useTransactionsPage';
import {
  TransactionFilters,
  TransactionList,
  TransactionGroupedView,
  TransactionPagination,
  TagSummaryView,
  EditTransactionModal,
  ReceiptScanner,
} from '../features/transactions';
import { TransactionFormDialog } from '../features/transactions/components/TransactionFormDialog';

export function TransactionsPage() {
  const page = useTransactionsPage();

  if (page.loading) {
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
            {page.total} {page.total === 1 ? 'transacción' : 'transacciones'}
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
          <Button
            variant={page.showTagSummary ? 'default' : 'outline'}
            onClick={() => page.setShowTagSummary(!page.showTagSummary)}
            className="w-full md:w-auto"
          >
            <Tag className="mr-2 h-4 w-4" />
            {page.showTagSummary ? 'Ver lista' : 'Resumen por tags'}
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
        groupByCategory={page.filters.groupByCategory}
        tag={page.filters.tag}
        categories={page.categories}
        accounts={page.accounts}
        availableTags={page.availableTags}
        hasActiveFilters={page.hasActiveFilters}
        onStartDateChange={page.setStartDate}
        onEndDateChange={page.setEndDate}
        onToggleCategory={page.toggleCategory}
        onRemoveCategory={page.removeCategory}
        onAccountChange={page.setAccountId}
        onMinAmountChange={page.setMinAmount}
        onMaxAmountChange={page.setMaxAmount}
        onTypeChange={page.setType}
        onGroupByCategoryChange={page.setGroupByCategory}
        onTagChange={page.setTag}
        onClearFilters={page.clearFilters}
      />

      {/* Tag Summary View */}
      {page.showTagSummary && (
        <TagSummaryView
          summary={page.tagSummary}
          loading={page.tagSummaryLoading}
          onTagClick={(tagName) => {
            page.setShowTagSummary(false);
            page.setTag(tagName);
          }}
          onDeleted={() => {
            // reload is handled internally by useTags / useTagsSummary when needed
          }}
        />
      )}

      {/* Transactions — flat list or grouped view */}
      {!page.showTagSummary && !page.filters.groupByCategory ? (
        <TransactionList
          transactions={page.filteredTransactions}
          accounts={page.accounts}
          onDelete={page.setDeleteId}
          onEdit={page.handleEdit}
          onViewItems={page.handleViewItems}
          loadingItemsId={page.loadingItemsId}
          onCreateClick={page.handleOpenForm}
        />
      ) : !page.showTagSummary ? (
        page.groupedTransactions && (
          <TransactionGroupedView
            groupedTransactions={page.groupedTransactions}
            accounts={page.accounts}
            onDelete={page.setDeleteId}
            onEdit={page.handleEdit}
            onViewItems={page.handleViewItems}
            loadingItemsId={page.loadingItemsId}
            onCreateClick={page.handleOpenForm}
          />
        )
      ) : null}

      {/* Pagination */}
      {!page.showTagSummary &&
        page.total > page.itemsPerPage &&
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
        availableTags={page.availableTags}
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
        availableTags={page.availableTags}
        onClose={() => page.setEditingTransaction(null)}
        onSave={page.handleSaveEdit}
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
