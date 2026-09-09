import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentHistoryModal } from './PaymentHistoryModal';
import type { Debt } from '../../../types';

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

describe('PaymentHistoryModal', () => {
  it('sin pagos: muestra el mensaje vacío', () => {
    render(<PaymentHistoryModal debt={makeDebt()} onClose={vi.fn()} />);

    expect(screen.getByText('No hay pagos registrados para esta deuda')).toBeInTheDocument();
  });

  it('con pagos: muestra totales y cada pago', () => {
    const debt = makeDebt({
      payments: [
        {
          id: 'p1',
          amount: 200,
          principal: 180,
          interest: 20,
          paymentDate: '2024-02-01T10:00:00.000Z',
          notes: 'Primer pago',
        },
        {
          id: 'p2',
          amount: 100,
          principal: 100,
          interest: 0,
          paymentDate: '2024-03-01T10:00:00.000Z',
        },
      ],
    } as never);
    render(<PaymentHistoryModal debt={debt} onClose={vi.fn()} />);

    expect(screen.getByText('Pagos Realizados (2)')).toBeInTheDocument();
    expect(screen.getByText('Primer pago')).toBeInTheDocument();
    // Total pagado = 300
    expect(screen.getByText('300,00 €')).toBeInTheDocument();
  });

  it('el botón Cerrar dispara onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<PaymentHistoryModal debt={makeDebt()} onClose={onClose} />);

    // El diálogo también tiene su propio botón "X" con aria-label="Cerrar";
    // el segundo es el botón de texto real del footer.
    const closeButtons = screen.getAllByRole('button', { name: 'Cerrar' });
    await user.click(closeButtons[closeButtons.length - 1]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
