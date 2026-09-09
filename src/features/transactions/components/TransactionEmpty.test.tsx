import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionEmpty } from './TransactionEmpty';

describe('TransactionEmpty', () => {
  it('muestra el mensaje y llama onCreateClick al hacer click en el botón', async () => {
    const onCreateClick = vi.fn();
    const user = userEvent.setup();
    render(<TransactionEmpty onCreateClick={onCreateClick} />);

    expect(
      screen.getByText('No se encontraron transacciones con los filtros seleccionados.')
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Crear transacción/i }));

    expect(onCreateClick).toHaveBeenCalledTimes(1);
  });
});
