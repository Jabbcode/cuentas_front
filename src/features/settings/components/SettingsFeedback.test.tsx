import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsFeedback } from './SettingsFeedback';

describe('SettingsFeedback', () => {
  it('mensaje de éxito usa estilos verdes', () => {
    render(<SettingsFeedback message={{ type: 'success', text: 'Guardado' }} />);

    expect(screen.getByText('Guardado').className).toContain('text-green-800');
  });

  it('mensaje de error usa estilos rojos', () => {
    render(<SettingsFeedback message={{ type: 'error', text: 'Falló' }} />);

    expect(screen.getByText('Falló').className).toContain('text-red-800');
  });
});
