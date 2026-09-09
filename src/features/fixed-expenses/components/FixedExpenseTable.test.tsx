import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FixedExpenseTable } from './FixedExpenseTable';
import type { FixedExpense } from '../../../types';

type Item = FixedExpense & { isPaidThisMonth: boolean };

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'fe-1',
    userId: 'user-1',
    name: 'Netflix',
    amount: 15,
    type: 'expense',
    dueDay: 15,
    accountId: 'acc-1',
    categoryId: 'cat-1',
    isActive: true,
    autoGenerate: false,
    isPaidThisMonth: false,
    account: { id: 'acc-1', name: 'Cuenta Principal' },
    category: { id: 'cat-1', name: 'Ocio', icon: '🎬', color: '#f00' },
    ...overrides,
  } as unknown as Item;
}

const baseProps = {
  title: 'Gastos',
  type: 'expense' as const,
  totalAmount: 15,
  icon: <span>icon</span>,
  onPay: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onToggleActive: vi.fn(),
};

describe('FixedExpenseTable', () => {
  it('sin items: muestra el mensaje vacío para gastos', () => {
    render(
      <FixedExpenseTable
        {...baseProps}
        items={[]}
        onPay={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
      />
    );

    expect(screen.getByText('No tienes gastos fijos')).toBeInTheDocument();
  });

  it('sin items de ingresos: usa el texto correcto', () => {
    render(
      <FixedExpenseTable
        {...baseProps}
        type="income"
        items={[]}
        onPay={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
      />
    );

    expect(screen.getByText('No tienes ingresos fijos')).toBeInTheDocument();
  });

  it('con un item: lo renderiza en la fila de escritorio con su monto', () => {
    render(
      <FixedExpenseTable
        {...baseProps}
        items={[makeItem()]}
        onPay={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
      />
    );

    const table = screen.getByRole('table');
    expect(within(table).getByText('Netflix')).toBeInTheDocument();
    expect(within(table).getByText('15,00 €')).toBeInTheDocument();
  });

  it('abre el menú de opciones de una fila y dispara onEdit', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <FixedExpenseTable
        {...baseProps}
        items={[makeItem()]}
        onPay={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
      />
    );

    // Dos triggers con el mismo aria-label (mobile + desktop); cualquiera abre el mismo menú lógico.
    const [trigger] = screen.getAllByRole('button', { name: 'Opciones de Netflix' });
    await user.click(trigger);
    await user.click(screen.getByRole('menuitem', { name: /Editar/i }));

    expect(onEdit).toHaveBeenCalledWith('fe-1');
  });

  it('registrar pago con un monto distinto llama a onPay con el nuevo monto', async () => {
    const user = userEvent.setup();
    const onPay = vi.fn();
    render(
      <FixedExpenseTable
        {...baseProps}
        items={[makeItem()]}
        onPay={onPay}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
      />
    );

    const [payButton] = screen.getAllByTitle('Pagar');
    await user.click(payButton);
    const input = screen.getByDisplayValue('15');
    await user.clear(input);
    await user.type(input, '18');
    await user.click(screen.getByRole('button', { name: 'Confirmar Pago' }));

    expect(onPay).toHaveBeenCalledWith('fe-1', 18);
  });
});
