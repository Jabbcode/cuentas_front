import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CreditCardEmpty } from './CreditCardEmpty';

describe('CreditCardEmpty', () => {
  it('muestra el mensaje de que no hay tarjetas configuradas', () => {
    render(<CreditCardEmpty />);

    expect(screen.getByText('No tienes tarjetas de crédito configuradas.')).toBeInTheDocument();
  });
});
