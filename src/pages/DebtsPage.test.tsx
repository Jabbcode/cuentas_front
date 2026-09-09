import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DebtsPage } from './DebtsPage';
import { useDebtsPage } from '../features/debts/hooks/useDebtsPage';
import type { UseDebtsPageReturn } from '../features/debts/types';
import type { Debt } from '../types';

vi.mock('../features/debts/hooks/useDebtsPage');

function makeDebt(overrides: Partial<Debt> = {}): Debt {
  return {
    id: 'debt-1',
    userId: 'user-1',
    creditor: 'Banco',
    description: 'x',
    totalAmount: 100,
    remainingAmount: 50,
    status: 'active',
    startDate: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  } as Debt;
}

function mockPage(overrides: Partial<UseDebtsPageReturn> = {}): void {
  vi.mocked(useDebtsPage).mockReturnValue({
    debts: [],
    recurringPayments: [],
    loading: false,
    showForm: false,
    editingDebt: undefined,
    payingDebt: undefined,
    viewingHistory: undefined,
    configuringRecurring: undefined,
    editingRecurring: undefined,
    deleteId: null,
    deleteRecurringId: null,
    deleting: false,
    groups: { activeDebts: [], overdueDebts: [], paidDebts: [] },
    totals: { totalActiveDebt: 0, totalOverdueDebt: 0 },
    getDebtRecurringPayments: () => [],
    handleOpenCreate: vi.fn(),
    handleEditDebt: vi.fn(),
    handleCloseForm: vi.fn(),
    handleFormSuccess: vi.fn(),
    handlePay: vi.fn(),
    handleClosePay: vi.fn(),
    handleCloseHistory: vi.fn(),
    handleOpenRecurring: vi.fn(),
    handleEditRecurring: vi.fn(),
    handleCloseRecurring: vi.fn(),
    handleRecurringSuccess: vi.fn(),
    handleRequestDelete: vi.fn(),
    handleConfirmDelete: vi.fn(),
    handleCancelDelete: vi.fn(),
    handleRequestDeleteRecurring: vi.fn(),
    handleConfirmDeleteRecurring: vi.fn(),
    handleCancelDeleteRecurring: vi.fn(),
    handleViewHistory: vi.fn(),
    handleSetPayingDebt: vi.fn(),
    toggleActive: vi.fn(),
    reload: vi.fn(),
    loadError: null,
    ...overrides,
  });
}

describe('DebtsPage', () => {
  it('loading: muestra el spinner', () => {
    mockPage({ loading: true });
    const { container } = render(<DebtsPage />);

    expect(container.querySelector('[class*="animate-spin"]')).toBeInTheDocument();
  });

  it('con error: muestra ErrorCard con el mensaje y permite reintentar', () => {
    mockPage({ loadError: 'Error al cargar' });
    render(<DebtsPage />);

    expect(screen.getByText('Error al cargar')).toBeInTheDocument();
  });

  it('sin deudas: muestra el estado vacío', () => {
    mockPage();
    render(<DebtsPage />);

    expect(screen.getByText('No tienes deudas registradas')).toBeInTheDocument();
  });

  it('con deudas vencidas, activas y pagadas: muestra cada sección con su total', () => {
    mockPage({
      groups: {
        overdueDebts: [makeDebt({ id: 'd-overdue', status: 'overdue' })],
        activeDebts: [makeDebt({ id: 'd-active' })],
        paidDebts: [makeDebt({ id: 'd-paid', status: 'paid' })],
      },
      totals: { totalActiveDebt: 50, totalOverdueDebt: 50 },
    });
    render(<DebtsPage />);

    // "Deudas Vencidas/Activas/Pagadas" también son labels de las tarjetas resumen;
    // el heading de sección es lo que distingue que la lista realmente renderizó.
    expect(screen.getByRole('heading', { name: 'Deudas Vencidas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Deudas Activas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Deudas Pagadas' })).toBeInTheDocument();
  });
});
