import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecurringPaymentsList } from './RecurringPaymentsList';
import type { RecurringDebtPayment } from '../../../types';

function makePayment(overrides: Partial<RecurringDebtPayment> = {}): RecurringDebtPayment {
  return {
    id: 'rp-1',
    debtId: 'debt-1',
    amount: 100,
    accountId: 'acc-1',
    frequency: 'monthly',
    dayOfMonth: 5,
    isActive: true,
    account: { id: 'acc-1', name: 'Cuenta Principal' },
    ...overrides,
  } as unknown as RecurringDebtPayment;
}

describe('RecurringPaymentsList', () => {
  it('lista vacía: no renderiza nada', () => {
    const { container } = render(
      <RecurringPaymentsList
        recurringPayments={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('muestra el pago activo con su cuenta y monto', () => {
    render(
      <RecurringPaymentsList
        recurringPayments={[makePayment()]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
      />
    );

    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Cuenta Principal')).toBeInTheDocument();
    expect(screen.getByText('Día 5 de cada mes')).toBeInTheDocument();
  });

  it('pago pausado: muestra "Pausado" y el botón de reanudar dispara onToggleActive(id, true)', async () => {
    const user = userEvent.setup();
    const onToggleActive = vi.fn();
    render(
      <RecurringPaymentsList
        recurringPayments={[makePayment({ isActive: false })]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={onToggleActive}
      />
    );

    expect(screen.getByText('Pausado')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reanudar' }));

    expect(onToggleActive).toHaveBeenCalledWith('rp-1', true);
  });

  it('editar y eliminar disparan sus callbacks con el payment/id correcto', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const payment = makePayment();
    render(
      <RecurringPaymentsList
        recurringPayments={[payment]}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={vi.fn()}
      />
    );

    const buttons = screen.getAllByRole('button');
    // orden: pausar/reanudar, editar (Pencil), eliminar (Trash2)
    await user.click(buttons[1]);
    expect(onEdit).toHaveBeenCalledWith(payment);

    await user.click(buttons[2]);
    expect(onDelete).toHaveBeenCalledWith('rp-1');
  });
});
