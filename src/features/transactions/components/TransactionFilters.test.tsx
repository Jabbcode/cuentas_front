import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionFilters } from './TransactionFilters';
import type { Category, Account } from '../../../types';

const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Comida',
    type: 'expense',
    icon: null,
    color: null,
    userId: 'u1',
    createdAt: '2024-01-01',
  },
];
const accounts: Account[] = [
  {
    id: 'acc-1',
    name: 'BBVA',
    type: 'bank',
    balance: 100,
    currency: 'EUR',
    createdAt: '2024-01-01',
  },
];

const baseProps = {
  startDate: '',
  endDate: '',
  categoryIds: [],
  accountId: 'all',
  minAmount: '',
  maxAmount: '',
  type: 'all' as const,
  categories,
  accounts,
  hasActiveFilters: false,
  onStartDateChange: vi.fn(),
  onEndDateChange: vi.fn(),
  onToggleCategory: vi.fn(),
  onRemoveCategory: vi.fn(),
  onAccountChange: vi.fn(),
  onMinAmountChange: vi.fn(),
  onMaxAmountChange: vi.fn(),
  onTypeChange: vi.fn(),
  onClearFilters: vi.fn(),
};

describe('TransactionFilters', () => {
  it('sin filtros activos no muestra chips ni el botón de limpiar', () => {
    render(<TransactionFilters {...baseProps} />);

    expect(screen.queryByText('Limpiar filtros')).not.toBeInTheDocument();
  });

  it('con filtros activos muestra chips y el botón de limpiar', async () => {
    const onClearFilters = vi.fn();
    const user = userEvent.setup();
    render(
      <TransactionFilters
        {...baseProps}
        startDate="2026-01-01"
        hasActiveFilters
        onClearFilters={onClearFilters}
      />
    );

    expect(screen.getByText('Desde: 2026-01-01')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Limpiar filtros' })[0]);
    expect(onClearFilters).toHaveBeenCalled();
  });

  it('cambiar el tipo llama onTypeChange', async () => {
    const onTypeChange = vi.fn();
    const user = userEvent.setup();
    render(<TransactionFilters {...baseProps} onTypeChange={onTypeChange} />);

    await user.selectOptions(screen.getByLabelText('Tipo'), 'expense');

    expect(onTypeChange).toHaveBeenCalledWith('expense');
  });

  it('abrir el dropdown de categorías y togglear una llama onToggleCategory', async () => {
    const onToggleCategory = vi.fn();
    const user = userEvent.setup();
    render(<TransactionFilters {...baseProps} onToggleCategory={onToggleCategory} />);

    await user.click(screen.getByText('Todas las categorías'));
    await user.click(screen.getByText('Comida'));

    expect(onToggleCategory).toHaveBeenCalledWith('cat-1');
  });

  it('quitar un chip de categoría seleccionada llama onRemoveCategory', async () => {
    const onRemoveCategory = vi.fn();
    const user = userEvent.setup();
    render(
      <TransactionFilters
        {...baseProps}
        categoryIds={['cat-1']}
        hasActiveFilters
        onRemoveCategory={onRemoveCategory}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Eliminar filtro Comida' }));

    expect(onRemoveCategory).toHaveBeenCalledWith('cat-1');
  });

  it('escribir en monto mínimo/máximo llama los handlers correspondientes', async () => {
    const onMinAmountChange = vi.fn();
    const user = userEvent.setup();
    render(<TransactionFilters {...baseProps} onMinAmountChange={onMinAmountChange} />);

    await user.type(screen.getByLabelText('Monto mínimo'), '5');

    expect(onMinAmountChange).toHaveBeenCalled();
  });
});
