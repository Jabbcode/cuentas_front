import { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { DebtCard } from '../components/debts/DebtCard';
import { DebtForm } from '../components/debts/DebtForm';
import { DebtPaymentModal } from '../components/debts/DebtPaymentModal';
import { RecurringPaymentModal } from '../components/debts/RecurringPaymentModal';
import { RecurringPaymentsList } from '../components/debts/RecurringPaymentsList';
import { PaymentHistoryModal } from '../components/debts/PaymentHistoryModal';
import { useDebts } from '../hooks/useDebts';
import { useRecurringDebtPayments } from '../hooks/useRecurringDebtPayments';
import { formatCurrency } from '../lib/utils';
import type { Debt, RecurringDebtPayment } from '../types';

export function DebtsPage() {
  const { debts, loading, reload, deleteDebt, payDebt } = useDebts();
  const { recurringPayments, reload: reloadRecurring, deleteRecurringPayment, toggleActive } = useRecurringDebtPayments();
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>();
  const [payingDebt, setPayingDebt] = useState<Debt | undefined>();
  const [viewingHistory, setViewingHistory] = useState<Debt | undefined>();
  const [configuringRecurring, setConfiguringRecurring] = useState<Debt | undefined>();
  const [editingRecurring, setEditingRecurring] = useState<RecurringDebtPayment | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteRecurringId, setDeleteRecurringId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteDebt(deleteId);
      setDeleteId(null);
    } catch (error) {
    } finally {
      setDeleting(false);
    }
  };

  const handlePay = async (amount: number, accountId: string, notes?: string) => {
    if (!payingDebt) return;
    await payDebt(payingDebt.id, amount, accountId, notes);
  };

  const handleDeleteRecurring = async () => {
    if (!deleteRecurringId) return;
    setDeleting(true);
    try {
      await deleteRecurringPayment(deleteRecurringId);
      setDeleteRecurringId(null);
    } catch (error) {
    } finally {
      setDeleting(false);
    }
  };

  const getDebtRecurringPayments = (debtId: string) => {
    return recurringPayments.filter((rp) => rp.debtId === debtId);
  };

  const activeDebts = debts.filter(d => d.status === 'active');
  const overdueDebts = debts.filter(d => d.status === 'overdue');
  const paidDebts = debts.filter(d => d.status === 'paid');

  const totalActiveDebt = activeDebts.reduce((sum, d) => sum + Number(d.remainingAmount), 0);
  const totalOverdueDebt = overdueDebts.reduce((sum, d) => sum + Number(d.remainingAmount), 0);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 dark:border-blue-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#F8FAFC]">Deudas</h1>
          <p className="text-gray-500 dark:text-[#64748B]">
            Gestiona tus deudas y realiza pagos
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Deuda
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-4">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Deudas Activas</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{activeDebts.length}</p>
          <p className="text-sm text-blue-700 dark:text-blue-300">{formatCurrency(totalActiveDebt)}</p>
        </div>

        {overdueDebts.length > 0 && (
          <div className="rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">Deudas Vencidas</p>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">{overdueDebts.length}</p>
            <p className="text-sm text-red-700 dark:text-red-300">{formatCurrency(totalOverdueDebt)}</p>
          </div>
        )}

        <div className="rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 p-4">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">Deudas Pagadas</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">{paidDebts.length}</p>
        </div>
      </div>

      {/* Debts List */}
      {debts.length === 0 ? (
        <div className="rounded-lg border border-gray-200 dark:border-[hsl(215_20%_25%)] bg-gray-50 dark:bg-[#1E293B] p-12 text-center">
          <p className="text-gray-500 dark:text-[#64748B]">No tienes deudas registradas</p>
          <Button onClick={() => setShowForm(true)} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Crear primera deuda
          </Button>
        </div>
      ) : (
        <>
          {/* Overdue Debts */}
          {overdueDebts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">⚠️ Deudas Vencidas</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {overdueDebts.map((debt) => (
                  <div key={debt.id} className="space-y-3">
                    <DebtCard
                      debt={debt}
                      onEdit={(d) => { setEditingDebt(d); setShowForm(true); }}
                      onDelete={setDeleteId}
                      onPay={setPayingDebt}
                      onViewHistory={setViewingHistory}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setConfiguringRecurring(debt)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configurar Pago Automático
                    </Button>
                    <RecurringPaymentsList
                      recurringPayments={getDebtRecurringPayments(debt.id)}
                      onEdit={(rp) => { setEditingRecurring(rp); setConfiguringRecurring(debt); }}
                      onDelete={setDeleteRecurringId}
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#F8FAFC] mb-3">Deudas Activas</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeDebts.map((debt) => (
                  <div key={debt.id} className="space-y-3">
                    <DebtCard
                      debt={debt}
                      onEdit={(d) => { setEditingDebt(d); setShowForm(true); }}
                      onDelete={setDeleteId}
                      onPay={setPayingDebt}
                      onViewHistory={setViewingHistory}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setConfiguringRecurring(debt)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configurar Pago Automático
                    </Button>
                    <RecurringPaymentsList
                      recurringPayments={getDebtRecurringPayments(debt.id)}
                      onEdit={(rp) => { setEditingRecurring(rp); setConfiguringRecurring(debt); }}
                      onDelete={setDeleteRecurringId}
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
              <h2 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">✓ Deudas Pagadas</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paidDebts.map((debt) => (
                  <div key={debt.id} className="space-y-3">
                    <DebtCard
                      debt={debt}
                      onEdit={(d) => { setEditingDebt(d); setShowForm(true); }}
                      onDelete={setDeleteId}
                      onPay={setPayingDebt}
                      onViewHistory={setViewingHistory}
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
        <DebtForm
          debt={editingDebt}
          onClose={() => {
            setShowForm(false);
            setEditingDebt(undefined);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingDebt(undefined);
            reload();
          }}
        />
      )}

      {/* Payment Modal */}
      {payingDebt && (
        <DebtPaymentModal
          debt={payingDebt}
          onClose={() => setPayingDebt(undefined)}
          onPay={handlePay}
        />
      )}

      {/* Payment History Modal */}
      {viewingHistory && (
        <PaymentHistoryModal
          debt={viewingHistory}
          onClose={() => setViewingHistory(undefined)}
        />
      )}

      {/* Recurring Payment Modal */}
      {configuringRecurring && (
        <RecurringPaymentModal
          debt={configuringRecurring}
          recurringPayment={editingRecurring}
          onClose={() => {
            setConfiguringRecurring(undefined);
            setEditingRecurring(undefined);
          }}
          onSuccess={() => {
            setConfiguringRecurring(undefined);
            setEditingRecurring(undefined);
            reloadRecurring();
          }}
        />
      )}

      {/* Delete Debt Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar deuda"
        description="¿Estás seguro de eliminar esta deuda? Esta acción no se puede deshacer y eliminará también el historial de pagos y pagos automáticos configurados."
        confirmText="Eliminar"
        loading={deleting}
      />

      {/* Delete Recurring Payment Confirmation */}
      <ConfirmDialog
        open={!!deleteRecurringId}
        onClose={() => setDeleteRecurringId(null)}
        onConfirm={handleDeleteRecurring}
        title="Eliminar pago automático"
        description="¿Estás seguro de eliminar este pago automático? Los pagos programados dejarán de procesarse."
        confirmText="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
