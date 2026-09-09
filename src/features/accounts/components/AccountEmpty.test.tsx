import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountEmpty } from './AccountEmpty';

describe('AccountEmpty', () => {
  it('muestra el mensaje y llama a onCreateClick al hacer click', async () => {
    const user = userEvent.setup();
    const onCreateClick = vi.fn();
    render(<AccountEmpty onCreateClick={onCreateClick} />);

    expect(screen.getByText('No tienes cuentas. Crea una para empezar.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /crear primera cuenta/i }));

    expect(onCreateClick).toHaveBeenCalledTimes(1);
  });
});
