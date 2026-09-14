import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreditCardOverduePeriods } from './CreditCardOverduePeriods';
import { formatDate } from '../../../lib/utils';
import type { CreditCardOverduePeriod } from '../../../types';

function fakePeriod(overrides: Partial<CreditCardOverduePeriod> = {}): CreditCardOverduePeriod {
  return {
    startDate: '2026-02-05',
    endDate: '2026-03-04',
    balance: 120,
    transactionCount: 3,
    paymentDueDate: '2026-03-20',
    daysOverdue: 5,
    ...overrides,
  };
}

describe('CreditCardOverduePeriods', () => {
  it('lista vacía: no renderiza nada', () => {
    const { container } = render(<CreditCardOverduePeriods periods={[]} onPayClick={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza cada período recibido, en el orden recibido', () => {
    const periods = [
      fakePeriod({ startDate: '2026-01-05', endDate: '2026-02-04' }),
      fakePeriod({ startDate: '2026-02-05', endDate: '2026-03-04' }),
      fakePeriod({ startDate: '2026-03-05', endDate: '2026-04-04' }),
    ];
    render(<CreditCardOverduePeriods periods={periods} onPayClick={vi.fn()} />);

    const rangeTexts = screen.getAllByText(/.+ - .+/).map((el) => el.textContent);
    expect(rangeTexts).toEqual(
      periods.map((p) => `${formatDate(p.startDate)} - ${formatDate(p.endDate)}`)
    );
  });

  it('click en Pagar de un ítem invoca el callback con ese período', async () => {
    const user = userEvent.setup();
    const onPayClick = vi.fn();
    const periods = [
      fakePeriod({ startDate: '2026-01-05', balance: 50 }),
      fakePeriod({ startDate: '2026-02-05', balance: 70 }),
    ];
    render(<CreditCardOverduePeriods periods={periods} onPayClick={onPayClick} />);

    const payButtons = screen.getAllByRole('button', { name: 'Pagar' });
    await user.click(payButtons[1]!);

    expect(onPayClick).toHaveBeenCalledWith(periods[1]);
  });
});
