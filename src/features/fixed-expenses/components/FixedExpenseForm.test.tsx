import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FixedExpenseForm } from './FixedExpenseForm';
import { fixedExpensesApi } from '../api';
import { accountsApi } from '../../accounts/api';
import { categoriesApi } from '../../categories/api';
import type { Account, Category, FixedExpense } from '../../../types';

vi.mock('../api', () => ({
  fixedExpensesApi: { getById: vi.fn(), create: vi.fn(), update: vi.fn() },
}));
vi.mock('../../accounts/api', () => ({ accountsApi: { getAll: vi.fn() } }));
vi.mock('../../categories/api', () => ({ categoriesApi: { getAll: vi.fn() } }));

const accounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Cuenta Principal',
    type: 'bank',
    balance: 1000,
    currency: 'EUR',
  } as Account,
];
const categories: Category[] = [
  { id: 'cat-expense', name: 'Alimentación', type: 'expense', icon: null, color: null } as Category,
  { id: 'cat-income', name: 'Salario', type: 'income', icon: null, color: null } as Category,
];

describe('FixedExpenseForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(accountsApi.getAll).mockResolvedValue(accounts);
    vi.mocked(categoriesApi.getAll).mockResolvedValue(categories);
  });

  it('modo creación: tras cargar, muestra el título y la primera categoría de gasto por defecto', async () => {
    render(<FixedExpenseForm onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(await screen.findByText('Nuevo Gasto Fijo')).toBeInTheDocument();
    expect(screen.getByText('Alimentación')).toBeInTheDocument();
  });

  it('crear: envía el payload correcto a fixedExpensesApi.create', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(fixedExpensesApi.create).mockResolvedValue({} as FixedExpense);
    render(<FixedExpenseForm onClose={vi.fn()} onSuccess={onSuccess} />);

    await screen.findByText('Nuevo Gasto Fijo');
    await user.type(screen.getByLabelText('Nombre'), 'Netflix');
    await user.type(screen.getByLabelText('Monto'), '15');
    await user.click(screen.getByRole('button', { name: 'Crear' }));

    await waitFor(() =>
      expect(fixedExpensesApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Netflix',
          amount: 15,
          type: 'expense',
          accountId: 'acc-1',
          categoryId: 'cat-expense',
        })
      )
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('cambiar a Ingreso filtra las categorías y selecciona la primera de ingreso', async () => {
    const user = userEvent.setup();
    render(<FixedExpenseForm onClose={vi.fn()} onSuccess={vi.fn()} />);

    await screen.findByText('Nuevo Gasto Fijo');
    await user.click(screen.getByRole('button', { name: 'Ingreso' }));

    expect(screen.getByText('Salario')).toBeInTheDocument();
    expect(screen.queryByText('Alimentación')).not.toBeInTheDocument();
  });

  it('modo edición: carga los datos existentes vía getById y llama a update al guardar', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(fixedExpensesApi.getById).mockResolvedValue({
      id: 'fe-1',
      name: 'Spotify',
      amount: 10,
      type: 'expense',
      dueDay: 5,
      description: null,
      accountId: 'acc-1',
      categoryId: 'cat-expense',
      creditCardAccountId: null,
      autoGenerate: false,
      transactions: [],
    } as unknown as FixedExpense & { transactions: never[] });
    vi.mocked(fixedExpensesApi.update).mockResolvedValue({} as FixedExpense);

    render(<FixedExpenseForm editId="fe-1" onClose={vi.fn()} onSuccess={onSuccess} />);

    expect(await screen.findByDisplayValue('Spotify')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Guardar Cambios' }));

    await waitFor(() =>
      expect(fixedExpensesApi.update).toHaveBeenCalledWith(
        'fe-1',
        expect.objectContaining({ name: 'Spotify' })
      )
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('el botón Cancelar dispara onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<FixedExpenseForm onClose={onClose} onSuccess={vi.fn()} />);

    await screen.findByText('Nuevo Gasto Fijo');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
