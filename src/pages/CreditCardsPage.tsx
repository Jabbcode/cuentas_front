import { useCreditCardsPage } from '../features/credit-cards/hooks/useCreditCardsPage';
import { ErrorCard } from '../components/ui/ErrorCard';
import { CreditCardPaymentModal } from '../features/credit-cards/components/CreditCardPaymentModal';
import { CreditCardExpenseModal } from '../features/credit-cards/components/CreditCardExpenseModal';
import { CreditCardEmpty } from '../features/credit-cards/components/CreditCardEmpty';
import { CreditCardSummary } from '../features/credit-cards/components/CreditCardSummary';
import { CreditCardItem } from '../features/credit-cards/components/CreditCardItem';
import { CreditCardTransactionsModal } from '../features/credit-cards/components/CreditCardTransactionsModal';

export function CreditCardsPage() {
  const {
    statements,
    accounts,
    loading,
    paying,
    collapsedCards,
    paymentModal,
    paymentFormData,
    transactionsModal,
    expenseModal,
    expenseFormData,
    savingExpense,
    expenseCategories,
    toggleCardCollapse,
    handleOpenPayment,
    handleClosePayment,
    handleOpenTransactions,
    handleCloseTransactions,
    handlePay,
    updatePaymentFormData,
    handleOpenExpense,
    handleCloseExpense,
    handleExpenseFormChange,
    handleSubmitExpense,
    reload,
    loadError,
  } = useCreditCardsPage();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 motion-safe:animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  if (loadError) {
    return <ErrorCard message={loadError} onRetry={reload} />;
  }

  if (statements.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarjetas de Crédito</h1>
          <p className="text-gray-600">Gestiona tus tarjetas de crédito</p>
        </div>
        <CreditCardEmpty />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tarjetas de Crédito</h1>
        <p className="text-gray-600">Gestiona tus tarjetas y pagos</p>
      </div>

      <CreditCardSummary statements={statements} />

      <div className="space-y-4">
        {statements.map((statement) => (
          <CreditCardItem
            key={statement.account.id}
            statement={statement}
            isCollapsed={collapsedCards.has(statement.account.id)}
            onToggleCollapse={() => toggleCardCollapse(statement.account.id)}
            onPayClick={handleOpenPayment}
            onViewTransactions={handleOpenTransactions}
            onCreateExpense={handleOpenExpense}
          />
        ))}
      </div>

      <CreditCardPaymentModal
        open={paymentModal.open}
        statement={paymentModal.statement}
        formData={paymentFormData}
        accounts={accounts}
        paying={paying}
        onClose={handleClosePayment}
        onSubmit={handlePay}
        onFormChange={updatePaymentFormData}
      />

      <CreditCardTransactionsModal
        open={transactionsModal.open}
        statement={transactionsModal.statement}
        onClose={handleCloseTransactions}
      />

      <CreditCardExpenseModal
        open={expenseModal.open}
        statement={expenseModal.statement}
        formData={expenseFormData}
        categories={expenseCategories}
        saving={savingExpense}
        onClose={handleCloseExpense}
        onSubmit={handleSubmitExpense}
        onFormChange={handleExpenseFormChange}
      />
    </div>
  );
}
