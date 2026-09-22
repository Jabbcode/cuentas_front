import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalysisFiltersBar } from './AnalysisFiltersBar';
import type { Account } from '../../../types';

const ACCOUNTS: Account[] = [
  { id: 'acc-1', name: 'Banco', type: 'bank', balance: 0, currency: 'EUR', createdAt: '' },
];

function renderBar(overrides: Partial<React.ComponentProps<typeof AnalysisFiltersBar>> = {}) {
  const props: React.ComponentProps<typeof AnalysisFiltersBar> = {
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    rangeError: null,
    onStartDateChange: vi.fn(),
    onEndDateChange: vi.fn(),
    accountId: 'all',
    accounts: ACCOUNTS,
    onAccountChange: vi.fn(),
    type: 'expense',
    onTypeChange: vi.fn(),
    ...overrides,
  };
  render(<AnalysisFiltersBar {...props} />);
  return props;
}

describe('AnalysisFiltersBar', () => {
  it('el toggle marca "Gasto" como activo por defecto', () => {
    renderBar();

    expect(screen.getByRole('button', { name: 'Gasto' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Ingreso' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('click en "Ingreso" llama onTypeChange("income")', () => {
    const props = renderBar();

    fireEvent.click(screen.getByRole('button', { name: 'Ingreso' }));

    expect(props.onTypeChange).toHaveBeenCalledWith('income');
  });

  it('sin rangeError, no muestra ningún mensaje de validación', () => {
    renderBar({ rangeError: null });

    expect(screen.queryByText(/debe ser anterior/i)).not.toBeInTheDocument();
  });

  it('con rangeError, muestra el mensaje', () => {
    renderBar({ rangeError: '"Desde" debe ser anterior o igual a "Hasta".' });

    expect(screen.getByText('"Desde" debe ser anterior o igual a "Hasta".')).toBeInTheDocument();
  });

  it('cambiar la cuenta llama onAccountChange con el id elegido', () => {
    const props = renderBar();

    fireEvent.change(screen.getByLabelText('Cuenta'), { target: { value: 'acc-1' } });

    expect(props.onAccountChange).toHaveBeenCalledWith('acc-1');
  });

  it('cambiar la fecha "desde" llama onStartDateChange', () => {
    const props = renderBar();

    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-02-01' } });

    expect(props.onStartDateChange).toHaveBeenCalledWith('2026-02-01');
  });
});
