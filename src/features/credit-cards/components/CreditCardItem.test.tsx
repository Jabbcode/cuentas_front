import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreditCardItem } from './CreditCardItem';
import type { CreditCardStatement } from '../../../types';

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
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      balance: 200,
      transactions: [],
      daysUntilCutoff: 5,
    },
    closedPeriod: {
      startDate: '2025-12-01',
      endDate: '2025-12-31',
      balance: 100,
      transactions: [],
      isPaid: false,
      paymentDueDate: '2026-01-10',
      daysUntilDue: 5,
    },
    creditLimit: 1000,
    available: 700,
    usagePercentage: 30,
    alerts: [],
    ...overrides,
  };
}

describe('CreditCardItem', () => {
  it('colapsado: no muestra el contenido expandido (alertas, períodos, botones)', () => {
    render(
      <CreditCardItem
        statement={makeStatement()}
        isCollapsed
        onToggleCollapse={vi.fn()}
        onPayClick={vi.fn()}
        onViewTransactions={vi.fn()}
        onCreateExpense={vi.fn()}
      />
    );

    expect(screen.queryByText('Ver todas las transacciones')).not.toBeInTheDocument();
  });

  it('expandido: muestra los botones de acción', () => {
    render(
      <CreditCardItem
        statement={makeStatement()}
        isCollapsed={false}
        onToggleCollapse={vi.fn()}
        onPayClick={vi.fn()}
        onViewTransactions={vi.fn()}
        onCreateExpense={vi.fn()}
      />
    );

    expect(screen.getByText('Ver todas las transacciones')).toBeInTheDocument();
    expect(screen.getByText('Agregar gasto')).toBeInTheDocument();
  });

  it('click en "Ver todas las transacciones" llama a onViewTransactions con el statement', async () => {
    const user = userEvent.setup();
    const onViewTransactions = vi.fn();
    const statement = makeStatement();
    render(
      <CreditCardItem
        statement={statement}
        isCollapsed={false}
        onToggleCollapse={vi.fn()}
        onPayClick={vi.fn()}
        onViewTransactions={onViewTransactions}
        onCreateExpense={vi.fn()}
      />
    );

    await user.click(screen.getByText('Ver todas las transacciones'));

    expect(onViewTransactions).toHaveBeenCalledWith(statement);
  });

  it('click en "Agregar gasto" llama a onCreateExpense con el statement', async () => {
    const user = userEvent.setup();
    const onCreateExpense = vi.fn();
    const statement = makeStatement();
    render(
      <CreditCardItem
        statement={statement}
        isCollapsed={false}
        onToggleCollapse={vi.fn()}
        onPayClick={vi.fn()}
        onViewTransactions={vi.fn()}
        onCreateExpense={onCreateExpense}
      />
    );

    await user.click(screen.getByText('Agregar gasto'));

    expect(onCreateExpense).toHaveBeenCalledWith(statement);
  });

  it('click en "Pagar" (período cerrado) llama a onPayClick con el statement', async () => {
    const user = userEvent.setup();
    const onPayClick = vi.fn();
    const statement = makeStatement();
    render(
      <CreditCardItem
        statement={statement}
        isCollapsed={false}
        onToggleCollapse={vi.fn()}
        onPayClick={onPayClick}
        onViewTransactions={vi.fn()}
        onCreateExpense={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /Pagar/ }));

    expect(onPayClick).toHaveBeenCalledWith(statement);
  });
});
