import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FixedExpensesPage } from './FixedExpensesPage';
import { useFixedExpensesPage } from '../features/fixed-expenses';
import type { UseFixedExpensesPageReturn } from '../features/fixed-expenses/types';
import type { FixedExpenseSummary } from '../types';

vi.mock('../features/fixed-expenses', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../features/fixed-expenses')>();
  return { ...actual, useFixedExpensesPage: vi.fn() };
});

function makeSummary(overrides: Partial<FixedExpenseSummary> = {}): FixedExpenseSummary {
  return {
    totalMonthlyExpenses: 100,
    totalMonthlyIncome: 200,
    totalCount: 2,
    paidCount: 1,
    pendingCount: 1,
    items: [],
    ...overrides,
  } as FixedExpenseSummary;
}

function mockPage(overrides: Partial<UseFixedExpensesPageReturn> = {}): void {
  vi.mocked(useFixedExpensesPage).mockReturnValue({
    summary: null,
    loading: false,
    showForm: false,
    editingId: null,
    deleteId: null,
    deleting: false,
    selectedExpenseCategories: [],
    selectedIncomeCategories: [],
    expenseCategories: [],
    incomeCategories: [],
    expenseItems: [],
    incomeItems: [],
    creditCardItems: [],
    debtPaymentItems: [],
    filteredExpenseTotal: 0,
    filteredIncomeTotal: 0,
    creditCardTotal: 0,
    debtPaymentTotal: 0,
    pendingAmount: 0,
    openCreateForm: vi.fn(),
    openEditForm: vi.fn(),
    closeForm: vi.fn(),
    handleFormSuccess: vi.fn(),
    requestDelete: vi.fn(),
    cancelDelete: vi.fn(),
    handleDelete: vi.fn(),
    payExpense: vi.fn(),
    toggleActive: vi.fn(),
    toggleExpenseCategory: vi.fn(),
    toggleIncomeCategory: vi.fn(),
    clearExpenseFilters: vi.fn(),
    clearIncomeFilters: vi.fn(),
    reload: vi.fn(),
    loadError: null,
    ...overrides,
  });
}

describe('FixedExpensesPage', () => {
  it('loading: muestra el spinner', () => {
    mockPage({ loading: true });
    const { container } = render(<FixedExpensesPage />);

    expect(container.querySelector('[class*="animate-spin"]')).toBeInTheDocument();
  });

  it('con error: muestra el mensaje', () => {
    mockPage({ loadError: 'Error al cargar' });
    render(<FixedExpensesPage />);

    expect(screen.getByText('Error al cargar')).toBeInTheDocument();
  });

  it('con pendientes: muestra el banner de pagos pendientes con el monto', () => {
    mockPage({ summary: makeSummary({ pendingCount: 2 }), pendingAmount: 50 });
    render(<FixedExpensesPage />);

    expect(screen.getByText('Tienes 2 pago(s) pendiente(s) este mes')).toBeInTheDocument();
    expect(screen.getByText(/50,00/)).toBeInTheDocument();
  });

  it('sin pagos de tarjeta ni deuda: no renderiza esas tablas, sí Gastos e Ingresos Fijos', () => {
    mockPage({ summary: makeSummary({ pendingCount: 0 }) });
    render(<FixedExpensesPage />);

    expect(screen.queryByText('Pagos de Tarjetas')).not.toBeInTheDocument();
    expect(screen.queryByText('Pagos de Deudas')).not.toBeInTheDocument();
    // "Gastos/Ingresos Fijos" también son labels en MonthlyFixedSummary; el h3
    // es el título de la tabla, lo que realmente confirma que se renderizó.
    expect(screen.getByRole('heading', { name: 'Gastos Fijos', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ingresos Fijos', level: 3 })).toBeInTheDocument();
  });

  it('con items de tarjeta y deuda: renderiza ambas tablas adicionales', () => {
    const item = {
      id: 'fe-1',
      name: 'Pago',
      amount: 10,
      type: 'expense',
      dueDay: 5,
      isActive: true,
      isPaidThisMonth: false,
    } as never;
    mockPage({
      summary: makeSummary(),
      creditCardItems: [item],
      debtPaymentItems: [item],
    });
    render(<FixedExpensesPage />);

    expect(screen.getByText('Pagos de Tarjetas')).toBeInTheDocument();
    expect(screen.getByText('Pagos de Deudas')).toBeInTheDocument();
  });
});
