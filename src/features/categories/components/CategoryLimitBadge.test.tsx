import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryLimitBadge } from './CategoryLimitBadge';

describe('CategoryLimitBadge', () => {
  it('sin límite: no renderiza nada', () => {
    const { container } = render(<CategoryLimitBadge spent={10} limit={null} percentage={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('modo completo: muestra el gasto, el límite y el porcentaje', () => {
    render(<CategoryLimitBadge spent={50} limit={100} percentage={50} />);

    expect(screen.getByText(/de/)).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('modo compact: muestra spent/limit y porcentaje en una línea', () => {
    render(<CategoryLimitBadge spent={50} limit={100} percentage={50} compact />);

    expect(screen.getByText('(50%)')).toBeInTheDocument();
  });

  it('percentage >= 100: muestra el mensaje de límite excedido con el monto', () => {
    render(<CategoryLimitBadge spent={120} limit={100} percentage={120} />);

    expect(screen.getByText(/Límite excedido/)).toBeInTheDocument();
  });

  it('percentage < 100: no muestra el mensaje de excedido', () => {
    render(<CategoryLimitBadge spent={50} limit={100} percentage={50} />);

    expect(screen.queryByText(/Límite excedido/)).not.toBeInTheDocument();
  });
});
