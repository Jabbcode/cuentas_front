import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconPicker } from './icon-picker';

describe('IconPicker', () => {
  it('el dropdown está cerrado por defecto', () => {
    render(<IconPicker value="Utensils" onChange={vi.fn()} />);
    expect(screen.queryByText('Alimentación')).not.toBeInTheDocument();
  });

  it('click en el trigger abre el dropdown con las categorías de íconos', async () => {
    const user = userEvent.setup();
    render(<IconPicker value="Utensils" onChange={vi.fn()} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Alimentación')).toBeInTheDocument();
    expect(screen.getByText('Transporte')).toBeInTheDocument();
  });

  it('elegir un ícono llama onChange y cierra el dropdown', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<IconPicker value="Utensils" onChange={onChange} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByTitle('Car'));

    expect(onChange).toHaveBeenCalledWith('Car');
    expect(screen.queryByText('Alimentación')).not.toBeInTheDocument();
  });
});
