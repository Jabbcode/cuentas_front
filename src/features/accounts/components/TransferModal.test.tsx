import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransferModal } from './TransferModal';
import { useTransfer } from '../../../hooks/useTransfer';
import { fakeAccount } from '../../../test-utils/fixtures';

vi.mock('../../../hooks/useTransfer');
const mockedUseTransfer = vi.mocked(useTransfer);

describe('TransferModal', () => {
  it('preselecciona origen=primera cuenta, destino=segunda cuenta', () => {
    mockedUseTransfer.mockReturnValue({
      transfer: vi.fn(),
      loading: false,
      error: null,
      clearError: vi.fn(),
    });
    const accounts = [
      fakeAccount({ id: 'a1', name: 'Origen', balance: 500 }),
      fakeAccount({ id: 'a2', name: 'Destino', balance: 200 }),
    ];
    render(<TransferModal accounts={accounts} onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByText('Saldo: 500,00 €')).toBeInTheDocument();
    expect(screen.getByText('Saldo: 200,00 €')).toBeInTheDocument();
  });

  it('el destino no puede ser igual al origen: si se cambia el origen al valor del destino, el destino cambia', async () => {
    const user = userEvent.setup();
    mockedUseTransfer.mockReturnValue({
      transfer: vi.fn(),
      loading: false,
      error: null,
      clearError: vi.fn(),
    });
    const accounts = [
      fakeAccount({ id: 'a1', name: 'Cuenta A' }),
      fakeAccount({ id: 'a2', name: 'Cuenta B' }),
      fakeAccount({ id: 'a3', name: 'Cuenta C' }),
    ];
    render(<TransferModal accounts={accounts} onClose={vi.fn()} onSuccess={vi.fn()} />);

    const [origenSelect, destinoSelect] = screen.getAllByRole('combobox') as HTMLSelectElement[];
    await user.selectOptions(origenSelect, 'a2');

    expect(destinoSelect.value).not.toBe('a2');
  });

  it('submit llama a transfer con el monto parseado y la nota', async () => {
    const user = userEvent.setup();
    const transfer = vi.fn().mockResolvedValue(undefined);
    mockedUseTransfer.mockReturnValue({
      transfer,
      loading: false,
      error: null,
      clearError: vi.fn(),
    });
    const accounts = [fakeAccount({ id: 'a1' }), fakeAccount({ id: 'a2' })];
    render(<TransferModal accounts={accounts} onClose={vi.fn()} onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText('Monto'), '50');
    await user.type(screen.getByLabelText('Nota (opcional)'), 'Pago');
    await user.click(screen.getByRole('button', { name: 'Transferir' }));

    expect(transfer).toHaveBeenCalledWith({
      fromAccountId: 'a1',
      toAccountId: 'a2',
      amount: 50,
      note: 'Pago',
    });
  });

  it('sin monto: el botón Transferir está deshabilitado', () => {
    mockedUseTransfer.mockReturnValue({
      transfer: vi.fn(),
      loading: false,
      error: null,
      clearError: vi.fn(),
    });
    const accounts = [fakeAccount({ id: 'a1' }), fakeAccount({ id: 'a2' })];
    render(<TransferModal accounts={accounts} onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Transferir' })).toBeDisabled();
  });

  it('loading=true muestra "Transfiriendo..." y deshabilita el botón', () => {
    mockedUseTransfer.mockReturnValue({
      transfer: vi.fn(),
      loading: true,
      error: null,
      clearError: vi.fn(),
    });
    const accounts = [fakeAccount({ id: 'a1' }), fakeAccount({ id: 'a2' })];
    render(<TransferModal accounts={accounts} onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Transfiriendo...' })).toBeDisabled();
  });

  it('muestra el mensaje de error del hook', () => {
    mockedUseTransfer.mockReturnValue({
      transfer: vi.fn(),
      loading: false,
      error: 'Saldo insuficiente',
      clearError: vi.fn(),
    });
    const accounts = [fakeAccount({ id: 'a1' }), fakeAccount({ id: 'a2' })];
    render(<TransferModal accounts={accounts} onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByText('Saldo insuficiente')).toBeInTheDocument();
  });

  it('click en Cancelar llama a onClose', async () => {
    const user = userEvent.setup();
    mockedUseTransfer.mockReturnValue({
      transfer: vi.fn(),
      loading: false,
      error: null,
      clearError: vi.fn(),
    });
    const onClose = vi.fn();
    const accounts = [fakeAccount({ id: 'a1' }), fakeAccount({ id: 'a2' })];
    render(<TransferModal accounts={accounts} onClose={onClose} onSuccess={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
