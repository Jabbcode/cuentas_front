import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FixedExpenseCard } from './FixedExpenseCard';
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

describe('FixedExpenseCard', () => {
  it('muestra nombre, cuenta y monto con signo negativo para gasto', () => {
    render(
      <FixedExpenseCard
        item={makeItem()}
        onPay={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
      />
    );

    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('Cuenta Principal')).toBeInTheDocument();
    expect(screen.getByText('-15,00 €')).toBeInTheDocument();
  });

  it('pagado este mes: muestra badge "Pagado" y no el botón de pago', () => {
    render(
      <FixedExpenseCard
        item={makeItem({ isPaidThisMonth: true })}
        onPay={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
      />
    );

    expect(screen.getByText('Pagado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Registrar Pago/i })).not.toBeInTheDocument();
  });

  it('inactivo: muestra el badge Pausado', () => {
    render(
      <FixedExpenseCard
        item={makeItem({ isActive: false })}
        onPay={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
      />
    );

    expect(screen.getByText('Pausado')).toBeInTheDocument();
  });

  it('vencido (dueDay < día actual, sin pagar): muestra badge Vencido', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 10)); // 10 jun 2024
    try {
      render(
        <FixedExpenseCard
          item={makeItem({ dueDay: 1 })} // día 1, hoy es 10 -> vencido
          onPay={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleActive={vi.fn()}
        />
      );

      expect(screen.getByText('Vencido')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('abre el menú y dispara onEdit/onToggleActive/onDelete', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onToggleActive = vi.fn();
    const onDelete = vi.fn();
    const item = makeItem();
    render(
      <FixedExpenseCard
        item={item}
        onPay={vi.fn()}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
      />
    );

    // El botón de menú (icono MoreVertical) no tiene aria-label propio; es el
    // único botón visible antes de que exista el diálogo de pago, así que
    // basta con tomar el primer botón renderizado en la card.
    const menuTrigger = screen.getAllByRole('button')[0];
    await user.click(menuTrigger);
    await user.click(screen.getByRole('button', { name: 'Editar' }));
    expect(onEdit).toHaveBeenCalledTimes(1);

    await user.click(menuTrigger);
    await user.click(screen.getByRole('button', { name: 'Pausar' }));
    expect(onToggleActive).toHaveBeenCalledWith('fe-1', true);

    await user.click(menuTrigger);
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(onDelete).toHaveBeenCalledWith('fe-1');
  });

  it('registrar pago con el mismo monto: llama onPay(id) sin monto explícito', async () => {
    const user = userEvent.setup();
    const onPay = vi.fn();
    render(
      <FixedExpenseCard
        item={makeItem()}
        onPay={onPay}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /Registrar Pago/i }));
    await user.click(screen.getByRole('button', { name: 'Confirmar Pago' }));

    expect(onPay).toHaveBeenCalledWith('fe-1');
  });

  it('registrar pago con monto distinto: llama onPay(id, monto)', async () => {
    const user = userEvent.setup();
    const onPay = vi.fn();
    render(
      <FixedExpenseCard
        item={makeItem()}
        onPay={onPay}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /Registrar Pago/i }));
    const input = screen.getByDisplayValue('15');
    await user.clear(input);
    await user.type(input, '20');
    await user.click(screen.getByRole('button', { name: 'Confirmar Pago' }));

    expect(onPay).toHaveBeenCalledWith('fe-1', 20);
  });
});
