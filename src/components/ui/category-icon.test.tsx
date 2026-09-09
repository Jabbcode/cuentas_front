import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryIcon, CategoryIconBadge } from './category-icon';

describe('CategoryIcon', () => {
  it('sin icon usa el ícono por defecto', () => {
    const { container } = render(<CategoryIcon icon={null} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('con tooltip envuelve el ícono en un span con title', () => {
    render(<CategoryIcon icon="Utensils" tooltip="Comida" />);
    expect(screen.getByTitle('Comida')).toBeInTheDocument();
  });

  it('aplica el color como estilo inline', () => {
    const { container } = render(<CategoryIcon icon="Utensils" color="#ff0000" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('CategoryIconBadge es un alias de CategoryIcon', () => {
    const { container } = render(<CategoryIconBadge icon="Utensils" tooltip="Comida" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByTitle('Comida')).toBeInTheDocument();
  });
});
