import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useCreditCards } from './useCreditCards';
import { creditCardsApi } from '../api';
import { getTodayDateString } from '../utils';
import type { CreditCardStatement } from '../../../types';
import type {
  PaymentFormData,
  PaymentModalState,
  TransactionsModalState,
  UseCreditCardsPageReturn,
} from '../types';

export function useCreditCardsPage(): UseCreditCardsPageReturn {
  const { statements, accounts, loading, reload, error: loadError } = useCreditCards();

  const [paying, setPaying] = useState(false);
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());

  const [paymentModal, setPaymentModal] = useState<PaymentModalState>({
    open: false,
    statement: null,
  });

  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData>({
    amount: '',
    paymentAccountId: '',
    paymentDate: getTodayDateString(),
  });

  const [transactionsModal, setTransactionsModal] = useState<TransactionsModalState>({
    open: false,
    statement: null,
  });

  // Initialize all cards collapsed when statements first load
  useEffect(() => {
    if (statements.length > 0 && collapsedCards.size === 0) {
      const allCardIds = statements.map((s) => s.account.id);
      setCollapsedCards(new Set(allCardIds));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statements]);

  const toggleCardCollapse = useCallback((accountId: string) => {
    setCollapsedCards((prev) => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  }, []);

  const defaultAccountId = accounts.length > 0 ? accounts[0].id : '';

  const handleOpenPayment = useCallback(
    (statement: CreditCardStatement) => {
      setPaymentModal({ open: true, statement });
      setPaymentFormData({
        amount: statement.closedPeriod.balance.toString(),
        paymentAccountId: defaultAccountId,
        paymentDate: getTodayDateString(),
      });
    },
    [defaultAccountId]
  );

  const handleClosePayment = useCallback(() => {
    setPaymentModal({ open: false, statement: null });
    setPaymentFormData({
      amount: '',
      paymentAccountId: defaultAccountId,
      paymentDate: getTodayDateString(),
    });
  }, [defaultAccountId]);

  const handleOpenTransactions = useCallback((statement: CreditCardStatement) => {
    setTransactionsModal({ open: true, statement });
  }, []);

  const handleCloseTransactions = useCallback(() => {
    setTransactionsModal({ open: false, statement: null });
  }, []);

  const updatePaymentFormData = useCallback((data: Partial<PaymentFormData>) => {
    setPaymentFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const handlePay = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!paymentModal.statement) return;

      setPaying(true);
      try {
        await creditCardsApi.payStatement(paymentModal.statement.account.id, {
          amount: parseFloat(paymentFormData.amount),
          paymentAccountId: paymentFormData.paymentAccountId,
          paymentDate: paymentFormData.paymentDate,
        });
        handleClosePayment();
        reload();
      } catch {
        toast.error('No se pudo registrar el pago de la tarjeta');
      } finally {
        setPaying(false);
      }
    },
    [paymentModal.statement, paymentFormData, handleClosePayment, reload]
  );

  return {
    statements,
    accounts,
    loading,
    paying,
    collapsedCards,
    paymentModal,
    paymentFormData,
    transactionsModal,
    toggleCardCollapse,
    handleOpenPayment,
    handleClosePayment,
    handleOpenTransactions,
    handleCloseTransactions,
    handlePay,
    updatePaymentFormData,
    reload,
    loadError,
  };
}
