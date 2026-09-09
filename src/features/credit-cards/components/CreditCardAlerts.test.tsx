import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CreditCardAlerts } from './CreditCardAlerts';

describe('CreditCardAlerts', () => {
  it('sin alertas: no renderiza nada', () => {
    const { container } = render(<CreditCardAlerts alerts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza el mensaje de cada alerta', () => {
    render(
      <CreditCardAlerts
        alerts={[
          { type: 'payment_due_soon', message: 'Pago vence en 2 días', severity: 'error' },
          { type: 'cutoff_soon', message: 'Corte en 3 días', severity: 'info' },
        ]}
      />
    );

    expect(screen.getByText('Pago vence en 2 días')).toBeInTheDocument();
    expect(screen.getByText('Corte en 3 días')).toBeInTheDocument();
  });

  it('severidad error aplica estilos de fondo rojo', () => {
    render(<CreditCardAlerts alerts={[{ type: 'x', message: 'urgente', severity: 'error' }]} />);

    expect(screen.getByText('urgente').closest('div')).toHaveClass('bg-red-50');
  });

  it('severidad warning aplica estilos ámbar', () => {
    render(<CreditCardAlerts alerts={[{ type: 'x', message: 'atención', severity: 'warning' }]} />);

    expect(screen.getByText('atención').closest('div')).toHaveClass('bg-amber-50');
  });

  it('severidad info aplica estilos azules', () => {
    render(<CreditCardAlerts alerts={[{ type: 'x', message: 'info', severity: 'info' }]} />);

    expect(screen.getByText('info').closest('div')).toHaveClass('bg-blue-50');
  });
});
