import { useState } from 'react';
import { CreditCardEmpty } from '../components/credit-cards/CreditCardEmpty';
import { CreditCardSummary } from '../components/credit-cards/CreditCardSummary';
import { CreditCardItem } from '../components/credit-cards/CreditCardItem';
import { CreditCardPaymentModal } from '../components/credit-cards/CreditCardPaymentModal';
import { useCreditCards } from '../hooks/useCreditCards';
import { usePaymentModal } from '../hooks/usePaymentModal';
import { creditCardsApi } from '../api/credit-cards.api';

export function CreditCardsPage() {
  const { statements, accounts, loading, reload } = useCreditCards();
  const [paying, setPaying] = useState(false);

  const defaultAccountId = accounts.length > 0 ? accounts[0].id : '';
  const paymentModal = usePaymentModal(defaultAccountId);

  const handleOpenPayment = (statement: any) => {
    paymentModal.openModal(statement, defaultAccountId);
  };

  const handleClosePayment = () => {
    paymentModal.closeModal(defaultAccountId);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModal.modal.statement) return;

    setPaying(true);
    try {
      await creditCardsApi.payStatement(paymentModal.modal.statement.account.id, {
        amount: parseFloat(paymentModal.formData.amount),
        paymentAccountId: paymentModal.formData.paymentAccountId,
        paymentDate: paymentModal.formData.paymentDate,
      });
      handleClosePayment();
      reload();
    } catch (error) {
      console.error('Error paying statement:', error);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  if (statements.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarjetas de Crédito</h1>
          <p className="text-gray-500">Gestiona tus tarjetas de crédito</p>
        </div>
        <CreditCardEmpty />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tarjetas de Crédito</h1>
        <p className="text-gray-500">Gestiona tus tarjetas y pagos</p>
      </div>

      <CreditCardSummary statements={statements} />

      <div className="space-y-4">
        {statements.map((statement) => (
          <CreditCardItem
            key={statement.account.id}
            statement={statement}
            onPayClick={handleOpenPayment}
          />
        ))}
      </div>

      <CreditCardPaymentModal
        open={paymentModal.modal.open}
        statement={paymentModal.modal.statement}
        formData={paymentModal.formData}
        accounts={accounts}
        paying={paying}
        onClose={handleClosePayment}
        onSubmit={handlePay}
        onFormChange={paymentModal.updateFormData}
      />
    </div>
  );
}
