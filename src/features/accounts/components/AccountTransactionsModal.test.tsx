import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountTransactionsModal } from './AccountTransactionsModal';
import { transactionsApi } from '../../transactions';
import type { Transaction } from '../../../types';
import { fakeAccount } from '../../../test-utils/fixtures';

vi.mock('../../transactions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../transactions')>();
  return { ...actual, transactionsApi: { ...actual.transactionsApi, getAll: vi.fn() } };
});

function fakeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 't1',
    accountId: 'a1',
    categoryId: 'c1',
    type: 'expense',
    amount: 50,
    description: 'Compra',
    date: '2026-01-10',
    category: { id: 'c1', name: 'Comida' },
    ...overrides,
  } as Transaction;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AccountTransactionsModal', () => {
  it('sin cuenta seleccionada no renderiza nada', () => {
    const { container } = render(
      <AccountTransactionsModal open={false} account={null} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('al abrir, carga las transacciones de la cuenta y las muestra', async () => {
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: [fakeTx({ description: 'Super' })],
      total: 1,
      limit: 1000,
      offset: 0,
    });

    render(<AccountTransactionsModal open account={fakeAccount()} onClose={vi.fn()} />);

    expect(transactionsApi.getAll).toHaveBeenCalledWith({ accountId: 'a1', limit: 1000 });
    await waitFor(() => expect(screen.getByText('Super')).toBeInTheDocument());
    expect(screen.getByText('1 transacción')).toBeInTheDocument();
  });

  it('sin transacciones tras cargar: muestra el mensaje vacío', async () => {
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: [],
      total: 0,
      limit: 1000,
      offset: 0,
    });

    render(<AccountTransactionsModal open account={fakeAccount()} onClose={vi.fn()} />);

    await waitFor(() =>
      expect(screen.getByText('No hay transacciones para mostrar')).toBeInTheDocument()
    );
  });

  it('filtro por tipo "Gastos" oculta los ingresos', async () => {
    const user = userEvent.setup();
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: [
        fakeTx({ id: 't1', type: 'expense', description: 'Gasto uno' }),
        fakeTx({ id: 't2', type: 'income', description: 'Ingreso uno' }),
      ],
      total: 2,
      limit: 1000,
      offset: 0,
    });

    render(<AccountTransactionsModal open account={fakeAccount()} onClose={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Gasto uno')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Gastos' }));

    expect(screen.getByText('Gasto uno')).toBeInTheDocument();
    expect(screen.queryByText('Ingreso uno')).not.toBeInTheDocument();
  });

  it('agrupar por categoría muestra los encabezados de grupo', async () => {
    const user = userEvent.setup();
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: [fakeTx({ category: { id: 'c1', name: 'Comida' } })],
      total: 1,
      limit: 1000,
      offset: 0,
    });

    render(<AccountTransactionsModal open account={fakeAccount()} onClose={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Compra')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Lista' }));

    expect(screen.getByText('Comida')).toBeInTheDocument();
  });

  it('filtrar por una categoría específica desde el dropdown', async () => {
    const user = userEvent.setup();
    vi.mocked(transactionsApi.getAll).mockResolvedValue({
      transactions: [
        fakeTx({
          id: 't1',
          description: 'Super',
          categoryId: 'c1',
          category: { id: 'c1', name: 'Comida' },
        }),
        fakeTx({
          id: 't2',
          description: 'Cine',
          categoryId: 'c2',
          category: { id: 'c2', name: 'Ocio' },
        }),
      ],
      total: 2,
      limit: 1000,
      offset: 0,
    });

    render(<AccountTransactionsModal open account={fakeAccount()} onClose={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Super')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /todas las categorías/i }));
    await user.click(screen.getByRole('button', { name: 'Ocio' }));

    expect(screen.getByText('Cine')).toBeInTheDocument();
    expect(screen.queryByText('Super')).not.toBeInTheDocument();
  });

  it('un error al cargar no rompe el render (queda sin transacciones)', async () => {
    vi.mocked(transactionsApi.getAll).mockRejectedValue(new Error('network error'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(<AccountTransactionsModal open account={fakeAccount()} onClose={vi.fn()} />);

    await waitFor(() =>
      expect(screen.getByText('No hay transacciones para mostrar')).toBeInTheDocument()
    );
  });
});
