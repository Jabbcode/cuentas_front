import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('renderiza el contenido', () => {
    render(<Badge>Nuevo</Badge>);
    expect(screen.getByText('Nuevo')).toBeInTheDocument();
  });

  it('aplica la clase del variant pedido', () => {
    render(<Badge variant="destructive">Error</Badge>);
    expect(screen.getByText('Error').className).toContain('bg-red-600');
  });

  it('usa el variant default cuando no se especifica', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default').className).toContain('bg-blue-600');
  });
});
