import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './select';

describe('Select', () => {
  it('elegir una opción llama onChange con el valor', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Select aria-label="tipo" onChange={onChange}>
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>
    );

    await user.selectOptions(screen.getByLabelText('tipo'), 'b');

    expect(onChange).toHaveBeenCalled();
    expect(screen.getByLabelText('tipo')).toHaveValue('b');
  });
});
