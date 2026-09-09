import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountsPage } from './AccountsPage';
import { useAccountsPage } from '../features/accounts/hooks/useAccountsPage';
import { api } from '../api/client';
import { fakeAccount } from '../test-utils/fixtures';

afterEach(() => {
  vi.restoreAllMocks();
});

vi.mock('../features/accounts/hooks/useAccountsPage');
const mockedUseAccountsPage = vi.mocked(useAccountsPage);

function baseReturn(overrides: Partial<ReturnType<typeof useAccountsPage>> = {}) {
  return {
    accounts: [],
    statementsMap: {},
    groupedAccounts: {},
    totalBalance: 0,
    unpaidClosedTotal: 0,
    loading: false,
    saving: false,
    deleting: false,
    showForm: false,
    editingAccount: null,
    deleteId: null,
    showTransfer: false,
    expandedSections: { bank: true, cash: true, credit_card: true },
    formData: {
      name: '',
      type: 'bank',
      balance: '',
      currency: 'EUR',
      color: '#3B82F6',
      creditLimit: '',
      cutoffDay: '',
      paymentDueDay: '',
      paymentAccountId: '',
    },
    openForm: vi.fn(),
    closeForm: vi.fn(),
    setFormData: vi.fn(),
    handleSubmit: vi.fn(),
    handleDelete: vi.fn(),
    setDeleteId: vi.fn(),
    setShowTransfer: vi.fn(),
    toggleSection: vi.fn(),
    reload: vi.fn(),
    loadError: null,
    selectedAccountId: null,
    setSelectedAccountId: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useAccountsPage>;
}

describe('AccountsPage', () => {
  it('loading=true muestra el spinner, no el header', () => {
    mockedUseAccountsPage.mockReturnValue(baseReturn({ loading: true }));

    render(<AccountsPage />);

    expect(screen.queryByText('Cuentas')).not.toBeInTheDocument();
  });

  it('loadError: muestra el ErrorCard y "Reintentar" llama a reload', async () => {
    const user = userEvent.setup();
    const reload = vi.fn();
    mockedUseAccountsPage.mockReturnValue(baseReturn({ loadError: 'Error de red', reload }));

    render(<AccountsPage />);
    expect(screen.getByText('Error de red')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('sin cuentas: muestra AccountEmpty, no secciones ni botón Transferir', () => {
    mockedUseAccountsPage.mockReturnValue(baseReturn({ accounts: [] }));

    render(<AccountsPage />);

    expect(screen.getByText('No tienes cuentas. Crea una para empezar.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /transferir/i })).not.toBeInTheDocument();
  });

  it('con cuentas: muestra el balance total y las secciones por tipo', () => {
    mockedUseAccountsPage.mockReturnValue(
      baseReturn({
        accounts: [fakeAccount(), fakeAccount({ id: 'a2', type: 'cash', name: 'Efectivo' })],
        groupedAccounts: {
          bank: [fakeAccount()],
          cash: [fakeAccount({ id: 'a2', type: 'cash', name: 'Efectivo' })],
        },
        totalBalance: 250,
      })
    );

    render(<AccountsPage />);

    expect(screen.getByText(/250,00/)).toBeInTheDocument();
    expect(screen.getByText('Bancos')).toBeInTheDocument();
    expect(screen.getAllByText('Efectivo').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /transferir/i })).toBeInTheDocument();
  });

  it('con período vencido sin pagar: muestra el aviso de descuento', () => {
    mockedUseAccountsPage.mockReturnValue(
      baseReturn({
        accounts: [fakeAccount()],
        groupedAccounts: { bank: [fakeAccount()] },
        unpaidClosedTotal: 75,
      })
    );

    render(<AccountsPage />);

    expect(screen.getByText(/descuento de 75,00/)).toBeInTheDocument();
  });

  it('click en "Nueva Cuenta" llama a openForm', async () => {
    const user = userEvent.setup();
    const openForm = vi.fn();
    mockedUseAccountsPage.mockReturnValue(baseReturn({ openForm }));

    render(<AccountsPage />);
    await user.click(screen.getByRole('button', { name: /nueva cuenta/i }));

    expect(openForm).toHaveBeenCalled();
  });

  it('deleteId presente: el ConfirmDialog está abierto, y cerrarlo llama a setDeleteId(null)', async () => {
    const user = userEvent.setup();
    const setDeleteId = vi.fn();
    mockedUseAccountsPage.mockReturnValue(baseReturn({ deleteId: 'a1', setDeleteId }));

    render(<AccountsPage />);
    expect(screen.getByText('Eliminar cuenta')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(setDeleteId).toHaveBeenCalledWith(null);
  });

  it('cuentas vacías: click en "Crear primera cuenta" también llama a openForm', async () => {
    const user = userEvent.setup();
    const openForm = vi.fn();
    mockedUseAccountsPage.mockReturnValue(baseReturn({ accounts: [], openForm }));

    render(<AccountsPage />);
    await user.click(screen.getByRole('button', { name: 'Crear primera cuenta' }));

    expect(openForm).toHaveBeenCalled();
  });

  it('con 2+ cuentas: click en "Transferir" llama a setShowTransfer(true)', async () => {
    const user = userEvent.setup();
    const setShowTransfer = vi.fn();
    mockedUseAccountsPage.mockReturnValue(
      baseReturn({
        accounts: [fakeAccount(), fakeAccount({ id: 'a2' })],
        groupedAccounts: { bank: [fakeAccount(), fakeAccount({ id: 'a2' })] },
        setShowTransfer,
      })
    );

    render(<AccountsPage />);
    await user.click(screen.getByRole('button', { name: /transferir/i }));

    expect(setShowTransfer).toHaveBeenCalledWith(true);
  });

  it('selectedAccountId presente: AccountTransactionsModal abierto, cerrarlo limpia la selección', async () => {
    const user = userEvent.setup();
    const setSelectedAccountId = vi.fn();
    mockedUseAccountsPage.mockReturnValue(
      baseReturn({
        accounts: [fakeAccount()],
        selectedAccountId: 'a1',
        setSelectedAccountId,
      })
    );
    vi.spyOn(api, 'get').mockResolvedValue({ data: { transactions: [], total: 0 } });

    render(<AccountsPage />);
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(setSelectedAccountId).toHaveBeenCalledWith(null);
  });

  it('showTransfer=true: al completar la transferencia, cierra el modal y recarga', async () => {
    const user = userEvent.setup();
    const setShowTransfer = vi.fn();
    const reload = vi.fn();
    mockedUseAccountsPage.mockReturnValue(
      baseReturn({
        accounts: [fakeAccount({ id: 'a1' }), fakeAccount({ id: 'a2' })],
        groupedAccounts: { bank: [fakeAccount({ id: 'a1' }), fakeAccount({ id: 'a2' })] },
        showTransfer: true,
        setShowTransfer,
        reload,
      })
    );
    vi.spyOn(api, 'post').mockResolvedValue({ data: { id: 't1' } });

    render(<AccountsPage />);
    await user.type(screen.getByLabelText('Monto'), '10');
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Transferir' }));

    await waitFor(() => expect(setShowTransfer).toHaveBeenCalledWith(false));
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
