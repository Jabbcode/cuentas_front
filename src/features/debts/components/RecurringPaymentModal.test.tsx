import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecurringPaymentModal } from './RecurringPaymentModal';
import { useAccounts } from '../../accounts/hooks/useAccounts';
import { recurringDebtPaymentsApi } from '../api';
import type { Debt, RecurringDebtPayment } from '../../../types';

vi.mock('../../accounts/hooks/useAccounts');
vi.mock('../api', () => ({
  recurringDebtPaymentsApi: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

function makeDebt(overrides: Partial<Debt> = {}): Debt {
  return {
    id: 'debt-1',
    userId: 'user-1',
    creditor: 'Banco Nacional',
    description: 'Préstamo',
    totalAmount: 1200,
    remainingAmount: 1200,
    status: 'active',
    startDate: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  } as Debt;
}

describe('RecurringPaymentModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAccounts).mockReturnValue({
      accounts: [{ id: 'acc-1', name: 'Cuenta Principal', balance: 1000 }] as never,
      loading: false,
      error: null,
      reload: vi.fn(),
    });
  });

  it('modo creación: sugiere el monto mensual (restante / 12) y frecuencia mensual por defecto', () => {
    render(<RecurringPaymentModal debt={makeDebt()} onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByText('Configurar Pago Automático')).toBeInTheDocument();
    expect(screen.getByLabelText(/Monto del Pago Automático/i)).toHaveValue(100); // 1200/12
    expect(screen.getByLabelText(/Día del Mes/i)).toBeInTheDocument();
  });

  it('crear: envía el payload con dayOfMonth y sin dayOfWeek para frecuencia mensual', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(recurringDebtPaymentsApi.create).mockResolvedValue({} as never);
    render(<RecurringPaymentModal debt={makeDebt()} onClose={vi.fn()} onSuccess={onSuccess} />);

    await user.selectOptions(screen.getByLabelText(/Cuenta para el Pago/i), 'acc-1');
    await user.click(screen.getByRole('button', { name: 'Activar' }));

    expect(recurringDebtPaymentsApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        debtId: 'debt-1',
        accountId: 'acc-1',
        frequency: 'monthly',
        dayOfMonth: 1,
        dayOfWeek: undefined,
      })
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('cambiar a frecuencia semanal muestra el día de la semana y oculta el día del mes', async () => {
    const user = userEvent.setup();
    render(<RecurringPaymentModal debt={makeDebt()} onClose={vi.fn()} onSuccess={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText(/Frecuencia/i), 'weekly');

    expect(screen.getByLabelText(/Día de la Semana/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Día del Mes/i)).not.toBeInTheDocument();
  });

  it('crear con frecuencia semanal: envía dayOfWeek y no dayOfMonth', async () => {
    const user = userEvent.setup();
    vi.mocked(recurringDebtPaymentsApi.create).mockResolvedValue({} as never);
    render(<RecurringPaymentModal debt={makeDebt()} onClose={vi.fn()} onSuccess={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText(/Frecuencia/i), 'weekly');
    await user.selectOptions(screen.getByLabelText(/Cuenta para el Pago/i), 'acc-1');
    await user.click(screen.getByRole('button', { name: 'Activar' }));

    expect(recurringDebtPaymentsApi.create).toHaveBeenCalledWith(
      expect.objectContaining({ frequency: 'weekly', dayOfWeek: 1, dayOfMonth: undefined })
    );
  });

  it('modo edición: precarga los valores del pago recurrente y llama a update', async () => {
    const user = userEvent.setup();
    const recurringPayment = {
      id: 'rp-1',
      debtId: 'debt-1',
      amount: 150,
      accountId: 'acc-1',
      frequency: 'monthly',
      dayOfMonth: 10,
      isActive: true,
    } as unknown as RecurringDebtPayment;
    vi.mocked(recurringDebtPaymentsApi.update).mockResolvedValue({} as never);
    render(
      <RecurringPaymentModal
        debt={makeDebt()}
        recurringPayment={recurringPayment}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText('Editar Pago Automático')).toBeInTheDocument();
    expect(screen.getByLabelText(/Monto del Pago Automático/i)).toHaveValue(150);

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(recurringDebtPaymentsApi.update).toHaveBeenCalledWith(
      'rp-1',
      expect.objectContaining({ amount: 150, accountId: 'acc-1' })
    );
  });
});
