// Public API of the credit-cards feature module

// Types
export type {
  PaymentFormData,
  PaymentModalState,
  TransactionsModalState,
  ExpenseFormData,
  ExpenseModalState,
  UseCreditCardsReturn,
  UseCreditCardsPageReturn,
} from './types';

// API
export { creditCardsApi } from './api';

// Utils
export {
  computeTotalToPay,
  countPendingCards,
  computeCurrentPeriodTotal,
  computeTotalUsed,
  getTodayDateString,
} from './utils';

// Hooks
export { useCreditCards } from './hooks/useCreditCards';
export { useCreditCardsPage } from './hooks/useCreditCardsPage';

// Components (feature-owned)
export { CreditCardPaymentModal } from './components/CreditCardPaymentModal';
export { CreditCardExpenseModal } from './components/CreditCardExpenseModal';
