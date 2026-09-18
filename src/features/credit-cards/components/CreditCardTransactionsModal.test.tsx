import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Transaction, CreditCardStatement, CreditCardOverduePeriod } from '../../../types';

const { mockToastError } = vi.hoisted(() => ({ mockToastError: vi.fn() }));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: mockToastError },
}));

vi.mock('../../../features/transactions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../features/transactions')>();
  return {
    ...actual,
    transactionsApi: { ...actual.transactionsApi, getAll: vi.fn(), delete: vi.fn() },
  };
});

import { transactionsApi } from '../../../features/transactions';
import { CreditCardTransactionsModal } from './CreditCardTransactionsModal';

function makeStatement(overrides: Partial<CreditCardStatement> = {}): CreditCardStatement {
  return {
    account: {
      id: 'card-1',
      name: 'Visa',
      type: 'credit_card',
      balance: 0,
      currency: 'EUR',
      createdAt: '2026-01-01',
    },
    currentPeriod: {
      startDate: '2026-01-05',
      endDate: '2026-01-31',
      balance: 0,
      transactions: [],
      daysUntilCutoff: 5,
    },
    closedPeriod: {
      startDate: '2025-12-01',
      endDate: '2025-12-31',
      balance: 0,
      transactions: [],
      isPaid: true,
      paymentDueDate: '2026-01-10',
      daysUntilDue: 5,
    },
    creditLimit: 1000,
    available: 1000,
    usagePercentage: 0,
    alerts: [],
    ...overrides,
  };
}

function makeOverduePeriod(
  overrides: Partial<CreditCardOverduePeriod> = {}
): CreditCardOverduePeriod {
  return {
    startDate: '2025-10-05',
    endDate: '2025-11-04',
    periodKey: '2025-10-05',
    balance: 40,
    transactionCount: 1,
    paymentDueDate: '2025-11-20',
    daysOverdue: 30,
    ...overrides,
  };
}

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'tx-1',
    amount: 50,
    type: 'expense',
    date: '2026-01-10',
    accountId: 'card-1',
    categoryId: 'cat-1',
    category: { id: 'cat-1', name: 'Compras', icon: 'shopping-cart' },
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
    ...overrides,
  };
}

describe('CreditCardTransactionsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('statement null: no renderiza nada', () => {
    const { container } = render(
      <CreditCardTransactionsModal
        open
        statement={null}
        onClose={vi.fn()}
        onAddExpenseClick={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('carga las transacciones de la cuenta al abrir', async () => {
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: [],
      total: 0,
      limit: 1000,
      offset: 0,
    });

    render(
      <CreditCardTransactionsModal
        open
        statement={makeStatement()}
        onClose={vi.fn()}
        onAddExpenseClick={vi.fn()}
      />
    );

    await waitFor(() =>
      expect(transactionsApi.getAll).toHaveBeenCalledWith({
        accountId: 'card-1',
        type: 'expense',
        limit: 1000,
      })
    );
  });

  it('sin transacciones: muestra el mensaje de período vacío', async () => {
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: [],
      total: 0,
      limit: 1000,
      offset: 0,
    });

    render(
      <CreditCardTransactionsModal
        open
        statement={makeStatement()}
        onClose={vi.fn()}
        onAddExpenseClick={vi.fn()}
      />
    );

    await waitFor(() =>
      expect(screen.getByText('No hay transacciones en este período')).toBeInTheDocument()
    );
  });

  it('muestra las transacciones cargadas y el total gastado', async () => {
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: [makeTx({ description: 'Super', amount: 50 })],
      total: 1,
      limit: 1000,
      offset: 0,
    });

    render(
      <CreditCardTransactionsModal
        open
        statement={makeStatement()}
        onClose={vi.fn()}
        onAddExpenseClick={vi.fn()}
      />
    );

    await waitFor(() => expect(screen.getByText('Super')).toBeInTheDocument());
    expect(screen.getAllByText('50,00 €').length).toBeGreaterThan(0);
  });

  it('filtro "Período Actual" excluye transacciones fuera de ese rango', async () => {
    const user = userEvent.setup();
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: [
        makeTx({ id: 'tx-current', date: '2026-01-10', description: 'Del período actual' }),
        makeTx({ id: 'tx-closed', date: '2025-12-15', description: 'Del período cerrado' }),
      ],
      total: 2,
      limit: 1000,
      offset: 0,
    });

    render(
      <CreditCardTransactionsModal
        open
        statement={makeStatement()}
        onClose={vi.fn()}
        onAddExpenseClick={vi.fn()}
      />
    );
    await waitFor(() => expect(screen.getByText('Del período actual')).toBeInTheDocument());

    await user.click(screen.getByText('Período Actual'));

    expect(screen.getByText('Del período actual')).toBeInTheDocument();
    expect(screen.queryByText('Del período cerrado')).not.toBeInTheDocument();
  });

  it('badge "Fijo" se muestra solo en transacciones con fixedExpenseId', async () => {
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: [makeTx({ fixedExpenseId: 'fe-1', description: 'Renta' })],
      total: 1,
      limit: 1000,
      offset: 0,
    });

    render(
      <CreditCardTransactionsModal
        open
        statement={makeStatement()}
        onClose={vi.fn()}
        onAddExpenseClick={vi.fn()}
      />
    );

    await waitFor(() => expect(screen.getByText('Fijo')).toBeInTheDocument());
  });

  it('toggle "Agrupado" agrupa las transacciones por categoría', async () => {
    const user = userEvent.setup();
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: [
        makeTx({ id: 'tx-1', category: { id: 'cat-1', name: 'Compras' } }),
        makeTx({ id: 'tx-2', category: { id: 'cat-1', name: 'Compras' } }),
      ],
      total: 2,
      limit: 1000,
      offset: 0,
    });

    render(
      <CreditCardTransactionsModal
        open
        statement={makeStatement()}
        onClose={vi.fn()}
        onAddExpenseClick={vi.fn()}
      />
    );
    await waitFor(() => expect(transactionsApi.getAll).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: /Lista/ }));

    expect(screen.getAllByText('Compras').length).toBeGreaterThan(0);
    expect(screen.getAllByText('100,00 €').length).toBeGreaterThan(0);
  });

  it('botón eliminar abre confirmación, y al confirmar borra y recarga la lista', async () => {
    const user = userEvent.setup();
    vi.mocked(transactionsApi.getAll)
      .mockResolvedValueOnce({
        transactions: [makeTx({ description: 'Super' })],
        total: 1,
        limit: 1000,
        offset: 0,
      })
      .mockResolvedValueOnce({ transactions: [], total: 0, limit: 1000, offset: 0 });
    vi.mocked(transactionsApi.delete).mockResolvedValue(undefined);

    render(
      <CreditCardTransactionsModal
        open
        statement={makeStatement()}
        onClose={vi.fn()}
        onAddExpenseClick={vi.fn()}
      />
    );
    await waitFor(() => expect(screen.getByText('Super')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Eliminar transacción' }));
    expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(transactionsApi.delete).toHaveBeenCalledWith('tx-1'));
    await waitFor(() => expect(transactionsApi.getAll).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.getByText('No hay transacciones en este período')).toBeInTheDocument()
    );
  });

  it('si falla el borrado: muestra un toast de error y no recarga', async () => {
    const user = userEvent.setup();
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: [makeTx({ description: 'Super' })],
      total: 1,
      limit: 1000,
      offset: 0,
    });
    vi.mocked(transactionsApi.delete).mockRejectedValue(new Error('network'));

    render(
      <CreditCardTransactionsModal
        open
        statement={makeStatement()}
        onClose={vi.fn()}
        onAddExpenseClick={vi.fn()}
      />
    );
    await waitFor(() => expect(screen.getByText('Super')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Eliminar transacción' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith('No se pudo eliminar la transacción')
    );
    expect(transactionsApi.getAll).toHaveBeenCalledTimes(1);
  });

  it('sin overduePeriod: no muestra la pestaña "Período Vencido"', async () => {
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: [],
      total: 0,
      limit: 1000,
      offset: 0,
    });

    render(
      <CreditCardTransactionsModal
        open
        statement={makeStatement()}
        onClose={vi.fn()}
        onAddExpenseClick={vi.fn()}
      />
    );

    await waitFor(() => expect(transactionsApi.getAll).toHaveBeenCalled());
    expect(screen.queryByText(/Período Vencido/)).not.toBeInTheDocument();
  });

  it('con overduePeriod: abre preseleccionado en esa pestaña y filtra solo esas transacciones', async () => {
    const overduePeriod = makeOverduePeriod();
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: [
        makeTx({ id: 'tx-overdue', date: '2025-10-20', description: 'Del período vencido' }),
        makeTx({ id: 'tx-other', date: '2026-01-10', description: 'De otro período' }),
      ],
      total: 2,
      limit: 1000,
      offset: 0,
    });

    render(
      <CreditCardTransactionsModal
        open
        statement={makeStatement()}
        overduePeriod={overduePeriod}
        onClose={vi.fn()}
        onAddExpenseClick={vi.fn()}
      />
    );

    await waitFor(() => expect(screen.getByText('Del período vencido')).toBeInTheDocument());
    expect(screen.queryByText('De otro período')).not.toBeInTheDocument();
    expect(screen.getByText(/Período Vencido/)).toHaveClass('bg-red-100');
  });

  it('con overduePeriod: cambiar a "Todas" muestra también las transacciones de otros períodos', async () => {
    const user = userEvent.setup();
    const overduePeriod = makeOverduePeriod();
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: [
        makeTx({ id: 'tx-overdue', date: '2025-10-20', description: 'Del período vencido' }),
        makeTx({ id: 'tx-other', date: '2026-01-10', description: 'De otro período' }),
      ],
      total: 2,
      limit: 1000,
      offset: 0,
    });

    render(
      <CreditCardTransactionsModal
        open
        statement={makeStatement()}
        overduePeriod={overduePeriod}
        onClose={vi.fn()}
        onAddExpenseClick={vi.fn()}
      />
    );
    await waitFor(() => expect(screen.getByText('Del período vencido')).toBeInTheDocument());

    await user.click(screen.getByText('Todas'));

    expect(screen.getByText('De otro período')).toBeInTheDocument();
  });

  it('click en "Agregar gasto" invoca el callback con el statement', async () => {
    const user = userEvent.setup();
    const onAddExpenseClick = vi.fn();
    const statement = makeStatement();
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: [],
      total: 0,
      limit: 1000,
      offset: 0,
    });

    render(
      <CreditCardTransactionsModal
        open
        statement={statement}
        onClose={vi.fn()}
        onAddExpenseClick={onAddExpenseClick}
      />
    );
    await waitFor(() => expect(transactionsApi.getAll).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: 'Agregar gasto' }));

    expect(onAddExpenseClick).toHaveBeenCalledWith(statement);
  });
});
