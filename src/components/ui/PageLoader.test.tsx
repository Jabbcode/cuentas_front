import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageLoader } from './PageLoader';

describe('PageLoader', () => {
  it('renderiza el rol status con el texto de carga', () => {
    render(<PageLoader />);
    expect(screen.getByRole('status')).toHaveTextContent('Cargando…');
  });
});
