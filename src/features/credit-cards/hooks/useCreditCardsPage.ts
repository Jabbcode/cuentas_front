import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '../../../lib/logger';
import { useCreditCards } from './useCreditCards';
import { useCategories } from '../../categories/hooks/useCategories';
import { transactionsApi } from '../../transactions';
import { creditCardsApi } from '../api';
import { getTodayDateString, OVERDUE_MONTHS_DEFAULT } from '../utils';
import { getApiErrorMessage } from '../../../lib/api-errors';
import type { CreditCardStatement, CreditCardOverduePeriod } from '../../../types';
import type {
  PaymentFormData,
  PaymentModalState,
  TransactionsModalState,
  ExpenseFormData,
  ExpenseModalState,
  UseCreditCardsPageReturn,
} from '../types';

export function useCreditCardsPage(): UseCreditCardsPageReturn {
  const queryClient = useQueryClient();
  // Sin localStorage ni searchParams: se resetea al valor por defecto en cada visita (criterio de spec).
  const [overdueMonths, setOverdueMonths] = useState(OVERDUE_MONTHS_DEFAULT);
  const { statements, accounts, loading, reload, error: loadError } = useCreditCards(overdueMonths);
  const { categories } = useCategories();

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense'),
    [categories]
  );

  const [paying, setPaying] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());

  const [paymentModal, setPaymentModal] = useState<PaymentModalState>({
    open: false,
    statement: null,
    target: { kind: 'closed' },
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

  const [expenseModal, setExpenseModal] = useState<ExpenseModalState>({
    open: false,
    statement: null,
  });

  const [expenseFormData, setExpenseFormData] = useState<ExpenseFormData>({
    amount: '',
    categoryId: '',
    date: getTodayDateString(),
    description: '',
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
      setPaymentModal({ open: true, statement, target: { kind: 'closed' } });
      setPaymentFormData({
        amount: statement.closedPeriod.balance.toString(),
        paymentAccountId: defaultAccountId,
        paymentDate: getTodayDateString(),
      });
    },
    [defaultAccountId]
  );

  const handleOpenOverduePayment = useCallback(
    (statement: CreditCardStatement, period: CreditCardOverduePeriod) => {
      setPaymentModal({
        open: true,
        statement,
        target: {
          kind: 'overdue',
          // periodKey (no startDate): startDate es un ISO en UTC y puede desplazarse
          // un día en husos horarios adelantados a UTC; periodKey es la clave estable
          // que el backend espera en periodStart.
          periodStart: period.periodKey,
          endDate: period.endDate,
          amount: period.balance,
        },
      });
      setPaymentFormData({
        amount: period.balance.toString(),
        paymentAccountId: defaultAccountId,
        paymentDate: getTodayDateString(),
      });
    },
    [defaultAccountId]
  );

  const handleClosePayment = useCallback(() => {
    setPaymentModal({ open: false, statement: null, target: { kind: 'closed' } });
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

  const handleOpenExpense = useCallback(
    (statement: CreditCardStatement) => {
      setExpenseModal({ open: true, statement });
      setExpenseFormData({
        amount: '',
        categoryId: expenseCategories[0]?.id ?? '',
        date: getTodayDateString(),
        description: '',
      });
    },
    [expenseCategories]
  );

  const handleCloseExpense = useCallback(() => {
    setExpenseModal({ open: false, statement: null });
  }, []);

  const handleExpenseFormChange = useCallback((data: Partial<ExpenseFormData>) => {
    setExpenseFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const handleSubmitExpense = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!expenseModal.statement) return;

      setSavingExpense(true);
      try {
        const accountId = expenseModal.statement.account.id;
        await transactionsApi.create({
          amount: parseFloat(expenseFormData.amount),
          type: 'expense',
          description: expenseFormData.description || undefined,
          date: new Date(expenseFormData.date).toISOString(),
          accountId,
          categoryId: expenseFormData.categoryId,
        });
        logger.info('credit-card', 'Credit card expense created', { accountId });
        toast.success('Gasto agregado correctamente');
        handleCloseExpense();
        await queryClient.invalidateQueries({ queryKey: ['credit-card-statements'] });
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'No se pudo agregar el gasto'));
        logger.error('credit-card', 'Failed to create credit card expense', err);
      } finally {
        setSavingExpense(false);
      }
    },
    [expenseModal.statement, expenseFormData, handleCloseExpense, queryClient]
  );

  const handlePay = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!paymentModal.statement) return;

      setPaying(true);
      try {
        const cardId = paymentModal.statement.account.id;
        const periodStart =
          paymentModal.target.kind === 'overdue' ? paymentModal.target.periodStart : undefined;
        await creditCardsApi.payStatement(cardId, {
          amount: parseFloat(paymentFormData.amount),
          paymentAccountId: paymentFormData.paymentAccountId,
          paymentDate: paymentFormData.paymentDate,
          periodStart,
        });
        logger.info('credit-card', 'Credit card statement paid', {
          accountId: cardId,
          amount: paymentFormData.amount,
          periodStart,
        });
        handleClosePayment();
        await queryClient.invalidateQueries({
          queryKey: ['credit-card-statements', overdueMonths],
        });
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'No se pudo registrar el pago de la tarjeta'));
        logger.error('credit-card', 'Failed to pay credit card statement', err);
      } finally {
        setPaying(false);
      }
    },
    [
      paymentModal.statement,
      paymentModal.target,
      paymentFormData,
      handleClosePayment,
      queryClient,
      overdueMonths,
    ]
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
    expenseModal,
    expenseFormData,
    savingExpense,
    expenseCategories,
    toggleCardCollapse,
    handleOpenPayment,
    handleOpenOverduePayment,
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
    overdueMonths,
    setOverdueMonths,
  };
}
