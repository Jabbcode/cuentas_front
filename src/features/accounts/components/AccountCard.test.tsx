import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountCard } from './AccountCard';
import type { Account, CreditCardStatement } from '../../../types';

function fakeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: 'a1',
    name: 'Cuenta 1',
    type: 'bank',
    balance: 100,
    currency: 'EUR',
    createdAt: '2026-01-01',
    ...overrides,
  };
}

function fakeStatement(overrides: Partial<CreditCardStatement> = {}): CreditCardStatement {
  return {
    account: fakeAccount({ type: 'credit_card' }),
    currentPeriod: {
      startDate: '',
      endDate: '',
      balance: 200,
      transactions: [],
      daysUntilCutoff: 5,
    },
    closedPeriod: {
      startDate: '',
      endDate: '',
      balance: 0,
      transactions: [],
      isPaid: true,
      paymentDueDate: '',
      daysUntilDue: 10,
    },
    creditLimit: 1000,
    available: 800,
    usagePercentage: 20,
    alerts: [],
    ...overrides,
  } as CreditCardStatement;
}

describe('AccountCard', () => {
  it('cuenta regular: muestra nombre, tipo y balance formateado', () => {
    render(
      <AccountCard
        account={fakeAccount({ name: 'BBVA', balance: 1500 })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onViewTransactions={vi.fn()}
      />
    );

    expect(screen.getByText('BBVA')).toBeInTheDocument();
    expect(screen.getByText('Banco')).toBeInTheDocument();
    expect(screen.getByText(/1[.,]?500,00/)).toBeInTheDocument();
  });

  it('balance negativo se muestra en rojo', () => {
    render(
      <AccountCard
        account={fakeAccount({ balance: -50 })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onViewTransactions={vi.fn()}
      />
    );

    const amount = screen.getByText(/50,00/);
    expect(amount.className).toContain('text-red-600');
  });

  it('tarjeta de crédito sin statement: calcula disponible desde el balance de la cuenta', () => {
    render(
      <AccountCard
        account={fakeAccount({ type: 'credit_card', creditLimit: 1000, balance: -300 })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Disponible')).toBeInTheDocument();
    // available = 1000 - abs(-300) = 700
    expect(screen.getByText(/700,00/)).toBeInTheDocument();
  });

  it('tarjeta de crédito con statement: usa el disponible del statement, no el de la cuenta', () => {
    render(
      <AccountCard
        account={fakeAccount({ type: 'credit_card', creditLimit: 1000, balance: -999 })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        statement={fakeStatement({
          creditLimit: 1000,
          currentPeriod: { ...fakeStatement().currentPeriod, balance: 400 },
        })}
      />
    );

    // available = statement.creditLimit - currentPeriod.balance = 1000 - 400 = 600
    expect(screen.getByText(/600,00/)).toBeInTheDocument();
  });

  it('período cerrado vencido y sin pagar: muestra el badge de alerta', () => {
    render(
      <AccountCard
        account={fakeAccount({ type: 'credit_card', creditLimit: 1000 })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        statement={fakeStatement({
          closedPeriod: { ...fakeStatement().closedPeriod, balance: 150, isPaid: false },
        })}
      />
    );

    expect(screen.getByText('Período vencido sin pagar')).toBeInTheDocument();
  });

  it('período cerrado pagado: no muestra el badge de alerta', () => {
    render(
      <AccountCard
        account={fakeAccount({ type: 'credit_card', creditLimit: 1000 })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        statement={fakeStatement({
          closedPeriod: { ...fakeStatement().closedPeriod, balance: 150, isPaid: true },
        })}
      />
    );

    expect(screen.queryByText('Período vencido sin pagar')).not.toBeInTheDocument();
  });

  it('menú de opciones: abre, y cada acción llama al callback correcto y cierra el menú', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onViewTransactions = vi.fn();
    const account = fakeAccount({ name: 'Mi Cuenta' });
    render(
      <AccountCard
        account={account}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewTransactions={onViewTransactions}
      />
    );

    await user.click(screen.getByRole('button', { name: /opciones de mi cuenta/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: /transacciones/i }));
    expect(onViewTransactions).toHaveBeenCalledWith('a1');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /opciones de mi cuenta/i }));
    await user.click(screen.getByRole('menuitem', { name: /editar/i }));
    expect(onEdit).toHaveBeenCalledWith(account);

    await user.click(screen.getByRole('button', { name: /opciones de mi cuenta/i }));
    await user.click(screen.getByRole('menuitem', { name: /eliminar/i }));
    expect(onDelete).toHaveBeenCalledWith('a1');
  });

  it('Escape con el menú abierto lo cierra y devuelve el foco al botón que lo abrió', async () => {
    const user = userEvent.setup();
    render(
      <AccountCard
        account={fakeAccount()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onViewTransactions={vi.fn()}
      />
    );

    const trigger = screen.getByRole('button', { name: /opciones de cuenta 1/i });
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('click en el overlay cierra el menú', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AccountCard
        account={fakeAccount()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onViewTransactions={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /opciones de cuenta 1/i }));
    const overlay = container.querySelector('.fixed.inset-0.z-10')!;
    await user.click(overlay);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
