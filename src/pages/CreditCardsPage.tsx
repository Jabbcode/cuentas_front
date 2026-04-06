import { useState, useEffect } from 'react';
import { CreditCardEmpty } from '../components/credit-cards/CreditCardEmpty';
import { CreditCardSummary } from '../components/credit-cards/CreditCardSummary';
import { CreditCardItem } from '../components/credit-cards/CreditCardItem';
import { CreditCardPaymentModal } from '../components/credit-cards/CreditCardPaymentModal';
import { CreditCardTransactionsModal } from '../components/credit-cards/CreditCardTransactionsModal';
import { useCreditCards } from '../hooks/useCreditCards';
import { usePaymentModal } from '../hooks/usePaymentModal';
import { creditCardsApi } from '../api/credit-cards.api';
import type { CreditCardStatement } from '../types';

export function CreditCardsPage() {
  const { statements, accounts, loading, reload } = useCreditCards();
  const [paying, setPaying] = useState(false);
  const [transactionsModal, setTransactionsModal] = useState<{
    open: boolean;
    statement: CreditCardStatement | null;
  }>({ open: false, statement: null });
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());

  const defaultAccountId = accounts.length > 0 ? accounts[0].id : '';
  const paymentModal = usePaymentModal(defaultAccountId);

  // Initialize all cards as collapsed by default
  useEffect(() => {
    if (statements.length > 0 && collapsedCards.size === 0) {
      const allCardIds = statements.map(s => s.account.id);
      setCollapsedCards(new Set(allCardIds));
    }
  }, [statements]);

  const toggleCardCollapse = (accountId: string) => {
    setCollapsedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const handleOpenPayment = (statement: any) => {
    paymentModal.openModal(statement, defaultAccountId);
  };

  const handleClosePayment = () => {
    paymentModal.closeModal(defaultAccountId);
  };

  const handleOpenTransactions = (statement: CreditCardStatement) => {
    setTransactionsModal({ open: true, statement });
  };

  const handleCloseTransactions = () => {
    setTransactionsModal({ open: false, statement: null });
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
            isCollapsed={collapsedCards.has(statement.account.id)}
            onToggleCollapse={() => toggleCardCollapse(statement.account.id)}
            onPayClick={handleOpenPayment}
            onViewTransactions={handleOpenTransactions}
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

      <CreditCardTransactionsModal
        open={transactionsModal.open}
        statement={transactionsModal.statement}
        onClose={handleCloseTransactions}
      />
    </div>
  );
}
