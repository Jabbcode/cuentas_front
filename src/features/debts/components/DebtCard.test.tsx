import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DebtCard } from './DebtCard';
import type { Debt } from '../../../types';

function makeDebt(overrides: Partial<Debt> = {}): Debt {
  return {
    id: 'debt-1',
    userId: 'user-1',
    creditor: 'Banco Nacional',
    description: 'Préstamo personal',
    totalAmount: 1000,
    remainingAmount: 400,
    status: 'active',
    startDate: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  } as Debt;
}

describe('DebtCard', () => {
  it('muestra acreedor, descripción, montos y progreso para una deuda activa', () => {
    render(
      <DebtCard
        debt={makeDebt()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onPay={vi.fn()}
        onViewHistory={vi.fn()}
      />
    );

    expect(screen.getByText('Banco Nacional')).toBeInTheDocument();
    expect(screen.getByText('Préstamo personal')).toBeInTheDocument();
    expect(screen.getByText('Activa')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument(); // (1000-400)/1000
    expect(screen.getByRole('button', { name: /Realizar Pago/i })).toBeInTheDocument();
  });

  it('deuda pagada: sin barra de progreso ni botón de pago', () => {
    render(
      <DebtCard
        debt={makeDebt({ status: 'paid', remainingAmount: 0 })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onPay={vi.fn()}
        onViewHistory={vi.fn()}
      />
    );

    expect(screen.getByText('Pagada')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Realizar Pago/i })).not.toBeInTheDocument();
  });

  it('deuda vencida: muestra la alerta de vencida', () => {
    render(
      <DebtCard
        debt={makeDebt({ status: 'overdue' })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onPay={vi.fn()}
        onViewHistory={vi.fn()}
      />
    );

    expect(screen.getByText('Vencida')).toBeInTheDocument();
    expect(screen.getByText('Esta deuda está vencida')).toBeInTheDocument();
  });

  it('abre el menú y dispara onEdit/onDelete con los datos correctos', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const debt = makeDebt();
    render(
      <DebtCard
        debt={debt}
        onEdit={onEdit}
        onDelete={onDelete}
        onPay={vi.fn()}
        onViewHistory={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /Opciones de la deuda/i }));
    await user.click(screen.getByRole('menuitem', { name: /Editar/i }));
    expect(onEdit).toHaveBeenCalledWith(debt);

    await user.click(screen.getByRole('button', { name: /Opciones de la deuda/i }));
    await user.click(screen.getByRole('menuitem', { name: /Eliminar/i }));
    expect(onDelete).toHaveBeenCalledWith('debt-1');
  });

  it('click en "Realizar Pago" dispara onPay con la deuda', async () => {
    const user = userEvent.setup();
    const onPay = vi.fn();
    const debt = makeDebt();
    render(
      <DebtCard
        debt={debt}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onPay={onPay}
        onViewHistory={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /Realizar Pago/i }));

    expect(onPay).toHaveBeenCalledWith(debt);
  });

  it('con pagos realizados, muestra el link de historial y dispara onViewHistory', async () => {
    const user = userEvent.setup();
    const onViewHistory = vi.fn();
    const debt = makeDebt({ _count: { payments: 3 } });
    render(
      <DebtCard
        debt={debt}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onPay={vi.fn()}
        onViewHistory={onViewHistory}
      />
    );

    const link = screen.getByText(/Ver 3 pagos realizados/i);
    await user.click(link);

    expect(onViewHistory).toHaveBeenCalledWith(debt);
  });
});
