import { Plus, ArrowLeftRight, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { AccountEmpty } from '../features/accounts/components/AccountEmpty';
import { AccountTypeSection } from '../features/accounts/components/AccountTypeSection';
import { AccountFormDialog } from '../features/accounts/components/AccountFormDialog';
import { TransferModal } from '../features/accounts/components/TransferModal';
import { AccountTransactionsModal } from '../features/accounts/components/AccountTransactionsModal';
import { useAccountsPage } from '../features/accounts/hooks/useAccountsPage';
import { formatCurrency } from '../lib/utils';
import type { Account } from '../types';

const ACCOUNT_TYPE_LABELS: Record<Account['type'], string> = {
  cash: 'Efectivo',
  bank: 'Bancos',
  credit_card: 'Tarjetas de Crédito',
};

const ACCOUNT_TYPE_ORDER: Account['type'][] = ['bank', 'credit_card', 'cash'];

export function AccountsPage() {
  const {
    accounts,
    statementsMap,
    groupedAccounts,
    totalBalance,
    unpaidClosedTotal,
    loading,
    saving,
    deleting,
    showForm,
    editingAccount,
    deleteId,
    showTransfer,
    expandedSections,
    formData,
    openForm,
    closeForm,
    setFormData,
    handleSubmit,
    handleDelete,
    setDeleteId,
    setShowTransfer,
    toggleSection,
    reload,
    selectedAccountId,
    setSelectedAccountId,
  } = useAccountsPage();

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) ?? null;

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
          <h1 className="text-3xl font-bold text-gray-900">Cuentas</h1>
          <p className="text-gray-500">
            Balance total:{' '}
            <span className="font-semibold text-gray-900">{formatCurrency(totalBalance)}</span>
          </p>
          {unpaidClosedTotal > 0 && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-amber-600">
              <Info className="h-3.5 w-3.5 shrink-0" />
              Incluye descuento de {formatCurrency(unpaidClosedTotal)} por períodos vencidos sin
              pagar en tarjetas de crédito
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {accounts.length >= 2 && (
            <Button variant="outline" onClick={() => setShowTransfer(true)}>
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Transferir
            </Button>
          )}
          <Button onClick={() => openForm()}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cuenta
          </Button>
        </div>
      </div>

      {/* Account list */}
      <div className="space-y-8">
        {accounts.length === 0 ? (
          <AccountEmpty onCreateClick={() => openForm()} />
        ) : (
          ACCOUNT_TYPE_ORDER.map((type) => {
            const accountsOfType = groupedAccounts[type];
            if (!accountsOfType || accountsOfType.length === 0) return null;

            return (
              <AccountTypeSection
                key={type}
                type={type}
                label={ACCOUNT_TYPE_LABELS[type]}
                accounts={accountsOfType}
                isExpanded={expandedSections[type]}
                statementsMap={statementsMap}
                onToggle={toggleSection}
                onEdit={openForm}
                onDelete={setDeleteId}
                onViewTransactions={setSelectedAccountId}
              />
            );
          })
        )}
      </div>

      <AccountFormDialog
        open={showForm}
        editingAccount={editingAccount}
        formData={formData}
        saving={saving}
        accounts={accounts}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar cuenta"
        description="¿Estás seguro de eliminar esta cuenta? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={deleting}
      />

      <AccountTransactionsModal
        open={!!selectedAccountId}
        account={selectedAccount}
        onClose={() => setSelectedAccountId(null)}
      />

      {showTransfer && (
        <TransferModal
          accounts={accounts}
          onClose={() => setShowTransfer(false)}
          onSuccess={() => {
            setShowTransfer(false);
            reload();
          }}
        />
      )}
    </div>
  );
}
