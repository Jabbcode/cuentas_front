import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountTypeSection } from './AccountTypeSection';
import type { Account } from '../../../types';

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

describe('AccountTypeSection', () => {
  it('muestra la etiqueta y el conteo de cuentas', () => {
    render(
      <AccountTypeSection
        type="bank"
        label="Bancos"
        accounts={[fakeAccount(), fakeAccount({ id: 'a2' })]}
        isExpanded={false}
        statementsMap={{}}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onViewTransactions={vi.fn()}
      />
    );

    expect(screen.getByText('Bancos')).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('colapsado no renderiza las tarjetas de cuenta', () => {
    render(
      <AccountTypeSection
        type="bank"
        label="Bancos"
        accounts={[fakeAccount()]}
        isExpanded={false}
        statementsMap={{}}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onViewTransactions={vi.fn()}
      />
    );

    expect(screen.queryByText('Cuenta 1')).not.toBeInTheDocument();
  });

  it('expandido renderiza una AccountCard por cuenta', () => {
    render(
      <AccountTypeSection
        type="bank"
        label="Bancos"
        accounts={[fakeAccount({ name: 'BBVA' }), fakeAccount({ id: 'a2', name: 'Santander' })]}
        isExpanded
        statementsMap={{}}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onViewTransactions={vi.fn()}
      />
    );

    expect(screen.getByText('BBVA')).toBeInTheDocument();
    expect(screen.getByText('Santander')).toBeInTheDocument();
  });

  it('click en el header llama a onToggle con el type', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <AccountTypeSection
        type="cash"
        label="Efectivo"
        accounts={[]}
        isExpanded={false}
        statementsMap={{}}
        onToggle={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onViewTransactions={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /efectivo/i }));

    expect(onToggle).toHaveBeenCalledWith('cash');
  });
});
