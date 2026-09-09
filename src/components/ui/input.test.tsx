import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input', () => {
  it('escribir dispara onChange y actualiza el valor', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Input aria-label="monto" onChange={onChange} />);

    await user.type(screen.getByLabelText('monto'), 'hola');

    expect(onChange).toHaveBeenCalled();
    expect(screen.getByLabelText('monto')).toHaveValue('hola');
  });

  it('pasa el type al input nativo', () => {
    render(<Input type="password" aria-label="password" />);
    expect(screen.getByLabelText('password')).toHaveAttribute('type', 'password');
  });
});
