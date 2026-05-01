import { Plus, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { DebtCard } from '../features/debts/components/DebtCard';
import { DebtForm } from '../features/debts/components/DebtForm';
import { DebtPaymentModal } from '../features/debts/components/DebtPaymentModal';
import { RecurringPaymentModal } from '../features/debts/components/RecurringPaymentModal';
import { RecurringPaymentsList } from '../features/debts/components/RecurringPaymentsList';
import { PaymentHistoryModal } from '../features/debts/components/PaymentHistoryModal';
import { useDebtsPage } from '../features/debts/hooks/useDebtsPage';
import { formatCurrency } from '../lib/utils';

export function DebtsPage() {
  const {
    loading,
    showForm,
    editingDebt,
    payingDebt,
    viewingHistory,
    configuringRecurring,
    editingRecurring,
    deleteId,
    deleteRecurringId,
    deleting,
    groups,
    totals,
    getDebtRecurringPayments,
    handleOpenCreate,
    handleEditDebt,
    handleCloseForm,
    handleFormSuccess,
    handlePay,
    handleClosePay,
    handleCloseHistory,
    handleViewHistory,
    handleSetPayingDebt,
    handleOpenRecurring,
    handleEditRecurring,
    handleCloseRecurring,
    handleRecurringSuccess,
    handleRequestDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleRequestDeleteRecurring,
    handleConfirmDeleteRecurring,
    handleCancelDeleteRecurring,
    toggleActive,
  } = useDebtsPage();

  const { activeDebts, overdueDebts, paidDebts } = groups;
  const { totalActiveDebt, totalOverdueDebt } = totals;
  const allDebts = [...overdueDebts, ...activeDebts, ...paidDebts];

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
          <h1 className="text-3xl font-bold text-gray-900">Deudas</h1>
          <p className="text-gray-500">Gestiona tus deudas y realiza pagos</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Deuda
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-600">Deudas Activas</p>
          <p className="text-2xl font-bold text-blue-900">{activeDebts.length}</p>
          <p className="text-sm text-blue-700">{formatCurrency(totalActiveDebt)}</p>
        </div>

        {overdueDebts.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-600">Deudas Vencidas</p>
            <p className="text-2xl font-bold text-red-900">{overdueDebts.length}</p>
            <p className="text-sm text-red-700">{formatCurrency(totalOverdueDebt)}</p>
          </div>
        )}

        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-600">Deudas Pagadas</p>
          <p className="text-2xl font-bold text-green-900">{paidDebts.length}</p>
        </div>
      </div>

      {/* Debts List */}
      {allDebts.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <p className="text-gray-500">No tienes deudas registradas</p>
          <Button onClick={handleOpenCreate} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Crear primera deuda
          </Button>
        </div>
      ) : (
        <>
          {/* Overdue Debts */}
          {overdueDebts.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-red-600">Deudas Vencidas</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {overdueDebts.map((debt) => (
                  <div key={debt.id} className="space-y-3">
                    <DebtCard
                      debt={debt}
                      onEdit={handleEditDebt}
                      onDelete={handleRequestDelete}
                      onPay={handleSetPayingDebt}
                      onViewHistory={handleViewHistory}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleOpenRecurring(debt)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configurar Pago Automatico
                    </Button>
                    <RecurringPaymentsList
                      recurringPayments={getDebtRecurringPayments(debt.id)}
                      onEdit={(rp) => handleEditRecurring(rp, debt)}
                      onDelete={handleRequestDeleteRecurring}
                      onToggleActive={toggleActive}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Debts */}
          {activeDebts.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Deudas Activas</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeDebts.map((debt) => (
                  <div key={debt.id} className="space-y-3">
                    <DebtCard
                      debt={debt}
                      onEdit={handleEditDebt}
                      onDelete={handleRequestDelete}
                      onPay={handleSetPayingDebt}
                      onViewHistory={handleViewHistory}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleOpenRecurring(debt)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configurar Pago Automatico
                    </Button>
                    <RecurringPaymentsList
                      recurringPayments={getDebtRecurringPayments(debt.id)}
                      onEdit={(rp) => handleEditRecurring(rp, debt)}
                      onDelete={handleRequestDeleteRecurring}
                      onToggleActive={toggleActive}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paid Debts */}
          {paidDebts.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-green-600">Deudas Pagadas</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paidDebts.map((debt) => (
                  <div key={debt.id} className="space-y-3">
                    <DebtCard
                      debt={debt}
                      onEdit={handleEditDebt}
                      onDelete={handleRequestDelete}
                      onPay={handleSetPayingDebt}
                      onViewHistory={handleViewHistory}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Form Dialog */}
      {showForm && (
        <DebtForm debt={editingDebt} onClose={handleCloseForm} onSuccess={handleFormSuccess} />
      )}

      {/* Payment Modal */}
      {payingDebt && (
        <DebtPaymentModal debt={payingDebt} onClose={handleClosePay} onPay={handlePay} />
      )}

      {/* Payment History Modal */}
      {viewingHistory && <PaymentHistoryModal debt={viewingHistory} onClose={handleCloseHistory} />}

      {/* Recurring Payment Modal */}
      {configuringRecurring && (
        <RecurringPaymentModal
          debt={configuringRecurring}
          recurringPayment={editingRecurring}
          onClose={handleCloseRecurring}
          onSuccess={handleRecurringSuccess}
        />
      )}

      {/* Delete Debt Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar deuda"
        description="Estas seguro de eliminar esta deuda? Esta accion no se puede deshacer y eliminara tambien el historial de pagos y pagos automaticos configurados."
        confirmText="Eliminar"
        loading={deleting}
      />

      {/* Delete Recurring Payment Confirmation */}
      <ConfirmDialog
        open={!!deleteRecurringId}
        onClose={handleCancelDeleteRecurring}
        onConfirm={handleConfirmDeleteRecurring}
        title="Eliminar pago automatico"
        description="Estas seguro de eliminar este pago automatico? Los pagos programados dejaran de procesarse."
        confirmText="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
