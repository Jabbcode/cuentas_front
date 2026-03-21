import { useState, useCallback } from 'react';
import type { CreditCardStatement } from '../types';

export interface PaymentModalState {
  open: boolean;
  statement: CreditCardStatement | null;
}

export interface PaymentFormData {
  amount: string;
  paymentAccountId: string;
  paymentDate: string;
}

export function usePaymentModal(defaultAccountId: string = '') {
  const [modal, setModal] = useState<PaymentModalState>({
    open: false,
    statement: null,
  });

  const [formData, setFormData] = useState<PaymentFormData>({
    amount: '',
    paymentAccountId: defaultAccountId,
    paymentDate: new Date().toISOString().split('T')[0],
  });

  const openModal = useCallback((statement: CreditCardStatement, accountId: string = '') => {
    setModal({ open: true, statement });
    setFormData({
      amount: statement.closedPeriod.balance.toString(),
      paymentAccountId: accountId,
      paymentDate: new Date().toISOString().split('T')[0],
    });
  }, []);

  const closeModal = useCallback((accountId: string = '') => {
    setModal({ open: false, statement: null });
    setFormData({
      amount: '',
      paymentAccountId: accountId,
      paymentDate: new Date().toISOString().split('T')[0],
    });
  }, []);

  const updateFormData = useCallback((data: Partial<PaymentFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  return {
    modal,
    formData,
    openModal,
    closeModal,
    updateFormData,
  };
}
