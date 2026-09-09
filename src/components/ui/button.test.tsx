import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renderiza el contenido y responde al click', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Guardar</Button>);

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled bloquea el click', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button onClick={onClick} disabled>
        Guardar
      </Button>
    );

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('aplica la clase del variant y size pedidos', () => {
    render(
      <Button variant="destructive" size="lg">
        Eliminar
      </Button>
    );

    const btn = screen.getByRole('button', { name: 'Eliminar' });
    expect(btn.className).toContain('bg-red-600');
    expect(btn.className).toContain('h-11');
  });
});
