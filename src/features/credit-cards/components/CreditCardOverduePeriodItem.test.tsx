import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreditCardOverduePeriodItem } from './CreditCardOverduePeriodItem';
import { formatDate } from '../../../lib/utils';
import type { CreditCardOverduePeriod } from '../../../types';

// formatCurrency intercala un espacio Unicode (no un espacio ASCII normal) entre el
// monto y el símbolo — se busca por el número solo para no depender de ese carácter.
const AMOUNT_TEXT = /120,00/;

function fakePeriod(overrides: Partial<CreditCardOverduePeriod> = {}): CreditCardOverduePeriod {
  return {
    startDate: '2026-02-05',
    endDate: '2026-03-04',
    periodKey: '2026-02-05',
    balance: 120,
    periodLimit: 500,
    transactionCount: 3,
    paymentDueDate: '2026-03-20',
    daysOverdue: 5,
    ...overrides,
  };
}

describe('CreditCardOverduePeriodItem', () => {
  it('renderiza rango, monto, cantidad de transacciones y atraso', () => {
    const period = fakePeriod();
    render(
      <CreditCardOverduePeriodItem
        period={period}
        onPayClick={vi.fn()}
        onViewTransactionsClick={vi.fn()}
      />
    );

    expect(
      screen.getByText(`${formatDate(period.startDate)} - ${formatDate(period.endDate)}`)
    ).toBeInTheDocument();
    expect(screen.getByText(AMOUNT_TEXT)).toBeInTheDocument();
    expect(screen.getByText(/3 transacciones/)).toBeInTheDocument();
    expect(screen.getByText(/venció hace 5 días/)).toBeInTheDocument();
  });

  it('un día de atraso usa singular ("1 día")', () => {
    render(
      <CreditCardOverduePeriodItem
        period={fakePeriod({ daysOverdue: 1, transactionCount: 1 })}
        onPayClick={vi.fn()}
        onViewTransactionsClick={vi.fn()}
      />
    );

    expect(screen.getByText(/1 transacción\b/)).toBeInTheDocument();
    expect(screen.getByText(/venció hace 1 día\b/)).toBeInTheDocument();
  });

  it('click en Pagar invoca el callback con ese período', async () => {
    const user = userEvent.setup();
    const onPayClick = vi.fn();
    const period = fakePeriod();
    render(
      <CreditCardOverduePeriodItem
        period={period}
        onPayClick={onPayClick}
        onViewTransactionsClick={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Pagar' }));

    expect(onPayClick).toHaveBeenCalledWith(period);
  });

  it('click en "Ver transacciones" invoca el callback con ese período', async () => {
    const user = userEvent.setup();
    const onViewTransactionsClick = vi.fn();
    const period = fakePeriod();
    render(
      <CreditCardOverduePeriodItem
        period={period}
        onPayClick={vi.fn()}
        onViewTransactionsClick={onViewTransactionsClick}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Ver transacciones' }));

    expect(onViewTransactionsClick).toHaveBeenCalledWith(period);
  });

  it('atraso <= 15 días aplica estilos ámbar (warning)', () => {
    const period = fakePeriod({ daysOverdue: 10 });
    render(
      <CreditCardOverduePeriodItem
        period={period}
        onPayClick={vi.fn()}
        onViewTransactionsClick={vi.fn()}
      />
    );

    expect(screen.getByText(AMOUNT_TEXT).closest('div.rounded-lg')).toHaveClass('bg-amber-50');
  });

  it('atraso > 15 días aplica estilos rojos (error)', () => {
    const period = fakePeriod({ daysOverdue: 20 });
    render(
      <CreditCardOverduePeriodItem
        period={period}
        onPayClick={vi.fn()}
        onViewTransactionsClick={vi.fn()}
      />
    );

    expect(screen.getByText(AMOUNT_TEXT).closest('div.rounded-lg')).toHaveClass('bg-red-50');
  });

  it('muestra el límite vigente del período atrasado', () => {
    render(
      <CreditCardOverduePeriodItem period={fakePeriod({ periodLimit: 500 })} onPayClick={vi.fn()} />
    );

    expect(screen.getByText(/500,00/)).toBeInTheDocument();
  });

  it('periodLimit null: indica "sin configurar" en vez de un importe vacío', () => {
    render(
      <CreditCardOverduePeriodItem
        period={fakePeriod({ periodLimit: null })}
        onPayClick={vi.fn()}
      />
    );

    expect(screen.getByText(/sin configurar/)).toBeInTheDocument();
  });

  it('el botón Pagar y el periodKey del período siguen intactos (regresión)', async () => {
    const user = userEvent.setup();
    const onPayClick = vi.fn();
    const period = fakePeriod({ periodKey: '2026-05-05' });
    render(<CreditCardOverduePeriodItem period={period} onPayClick={onPayClick} />);

    await user.click(screen.getByRole('button', { name: 'Pagar' }));

    expect(onPayClick).toHaveBeenCalledWith(expect.objectContaining({ periodKey: '2026-05-05' }));
  });
});
