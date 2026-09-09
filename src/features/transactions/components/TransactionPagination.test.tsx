import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionPagination } from './TransactionPagination';

const baseProps = {
  currentPage: 2,
  totalPages: 5,
  startItem: 21,
  endItem: 40,
  total: 100,
  onPreviousPage: vi.fn(),
  onNextPage: vi.fn(),
  hasNextPage: true,
  hasPreviousPage: true,
};

describe('TransactionPagination', () => {
  it('muestra el rango y la página actual', () => {
    render(<TransactionPagination {...baseProps} />);

    expect(screen.getByText('Mostrando 21-40 de 100')).toBeInTheDocument();
    expect(screen.getByText('Página 2 de 5')).toBeInTheDocument();
  });

  it('llama onPreviousPage/onNextPage al hacer click', async () => {
    const onPreviousPage = vi.fn();
    const onNextPage = vi.fn();
    const user = userEvent.setup();
    render(
      <TransactionPagination
        {...baseProps}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    );

    await user.click(screen.getByRole('button', { name: /Anterior/i }));
    await user.click(screen.getByRole('button', { name: /Siguiente/i }));

    expect(onPreviousPage).toHaveBeenCalledTimes(1);
    expect(onNextPage).toHaveBeenCalledTimes(1);
  });

  it('deshabilita Anterior/Siguiente según hasPreviousPage/hasNextPage', () => {
    render(<TransactionPagination {...baseProps} hasPreviousPage={false} hasNextPage={false} />);

    expect(screen.getByRole('button', { name: /Anterior/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Siguiente/i })).toBeDisabled();
  });
});
