import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { UseCreditCardsPageReturn } from '../features/credit-cards/types';

const mockUseCreditCardsPage = vi.fn();
vi.mock('../features/credit-cards/hooks/useCreditCardsPage', () => ({
  useCreditCardsPage: () => mockUseCreditCardsPage(),
}));

import { CreditCardsPage } from './CreditCardsPage';

function baseReturn(overrides: Partial<UseCreditCardsPageReturn> = {}): UseCreditCardsPageReturn {
  return {
    statements: [],
    accounts: [],
    loading: false,
    paying: false,
    collapsedCards: new Set(),
    paymentModal: { open: false, statement: null },
    paymentFormData: { amount: '', paymentAccountId: '', paymentDate: '' },
    transactionsModal: { open: false, statement: null },
    expenseModal: { open: false, statement: null },
    expenseFormData: { amount: '', categoryId: '', date: '', description: '' },
    savingExpense: false,
    expenseCategories: [],
    toggleCardCollapse: vi.fn(),
    handleOpenPayment: vi.fn(),
    handleClosePayment: vi.fn(),
    handleOpenTransactions: vi.fn(),
    handleCloseTransactions: vi.fn(),
    handlePay: vi.fn(),
    updatePaymentFormData: vi.fn(),
    handleOpenExpense: vi.fn(),
    handleCloseExpense: vi.fn(),
    handleExpenseFormChange: vi.fn(),
    handleSubmitExpense: vi.fn(),
    reload: vi.fn(),
    loadError: null,
    ...overrides,
  };
}

describe('CreditCardsPage', () => {
  it('loading: muestra el spinner', () => {
    mockUseCreditCardsPage.mockReturnValue(baseReturn({ loading: true }));
    render(<CreditCardsPage />);

    expect(screen.queryByText('Tarjetas de Crédito')).not.toBeInTheDocument();
  });

  it('loadError: muestra el ErrorCard', () => {
    mockUseCreditCardsPage.mockReturnValue(baseReturn({ loadError: 'Fallo de red' }));
    render(<CreditCardsPage />);

    expect(screen.getByText('Fallo de red')).toBeInTheDocument();
  });

  it('sin tarjetas: muestra el estado vacío', () => {
    mockUseCreditCardsPage.mockReturnValue(baseReturn({ statements: [] }));
    render(<CreditCardsPage />);

    expect(screen.getByText('Tarjetas de Crédito')).toBeInTheDocument();
    expect(screen.getByText('No tienes tarjetas de crédito configuradas.')).toBeInTheDocument();
  });

  it('con tarjetas: renderiza un CreditCardItem por statement', () => {
    mockUseCreditCardsPage.mockReturnValue(
      baseReturn({
        statements: [
          {
            account: {
              id: 'card-1',
              name: 'Visa',
              type: 'credit_card',
              balance: 0,
              currency: 'EUR',
              createdAt: '2026-01-01',
            },
            currentPeriod: {
              startDate: '2026-01-01',
              endDate: '2026-01-31',
              balance: 0,
              transactions: [],
              daysUntilCutoff: 1,
            },
            closedPeriod: {
              startDate: '2025-12-01',
              endDate: '2025-12-31',
              balance: 0,
              transactions: [],
              isPaid: true,
              paymentDueDate: '2026-01-10',
              daysUntilDue: 1,
            },
            creditLimit: 1000,
            available: 1000,
            usagePercentage: 0,
            alerts: [],
          },
        ],
      })
    );
    render(<CreditCardsPage />);

    expect(screen.getByText('Visa')).toBeInTheDocument();
  });
});
