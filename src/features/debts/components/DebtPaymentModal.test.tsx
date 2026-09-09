import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DebtPaymentModal } from './DebtPaymentModal';
import { useAccounts } from '../../accounts/hooks/useAccounts';
import type { Debt } from '../../../types';

vi.mock('../../accounts/hooks/useAccounts');

function makeDebt(overrides: Partial<Debt> = {}): Debt {
  return {
    id: 'debt-1',
    userId: 'user-1',
    creditor: 'Banco Nacional',
    description: 'Préstamo',
    totalAmount: 1000,
    remainingAmount: 400,
    status: 'active',
    startDate: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  } as Debt;
}

function mockAccounts(accounts: { id: string; name: string; balance: number }[]) {
  vi.mocked(useAccounts).mockReturnValue({
    accounts: accounts as never,
    loading: false,
    error: null,
    reload: vi.fn(),
  });
}

describe('DebtPaymentModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAccounts([{ id: 'acc-1', name: 'Cuenta Principal', balance: 1000 }]);
  });

  it('modo pago total: precarga el monto = restante + interés (sin interés aquí)', () => {
    render(<DebtPaymentModal debt={makeDebt()} onClose={vi.fn()} onPay={vi.fn()} />);

    expect(screen.getByLabelText(/Monto a Pagar/i)).toHaveValue(400);
  });

  it('cambiar a monto personalizado permite editar el campo libremente', async () => {
    const user = userEvent.setup();
    render(<DebtPaymentModal debt={makeDebt()} onClose={vi.fn()} onPay={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /Monto Personalizado/i }));
    const amountInput = screen.getByLabelText(/Monto a Pagar/i);
    await user.clear(amountInput);
    await user.type(amountInput, '100');

    expect(amountInput).toHaveValue(100);
  });

  it('enviar con cuenta seleccionada llama a onPay y luego a onClose', async () => {
    const user = userEvent.setup();
    const onPay = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<DebtPaymentModal debt={makeDebt()} onClose={onClose} onPay={onPay} />);

    await user.selectOptions(screen.getByLabelText(/Cuenta de Pago/i), 'acc-1');
    await user.click(screen.getByRole('button', { name: 'Confirmar Pago' }));

    expect(onPay).toHaveBeenCalledWith(400, 'acc-1', undefined);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('sin cuentas con saldo suficiente: el botón de confirmar queda deshabilitado', () => {
    mockAccounts([{ id: 'acc-1', name: 'Cuenta Pobre', balance: 1 }]);
    render(<DebtPaymentModal debt={makeDebt()} onClose={vi.fn()} onPay={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Confirmar Pago' })).toBeDisabled();
  });
});
