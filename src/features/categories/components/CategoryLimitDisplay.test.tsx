import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('../api', () => ({
  categoriesApi: { getSpending: vi.fn() },
}));

import { categoriesApi } from '../api';
import { CategoryLimitDisplay } from './CategoryLimitDisplay';

const spending = {
  categoryId: 'cat-1',
  categoryName: 'Comida',
  spent: 50,
  limit: 100,
  remaining: 50,
  percentage: 50,
  isOverLimit: false,
};

describe('CategoryLimitDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el badge compact una vez que carga el spending', async () => {
    vi.mocked(categoriesApi.getSpending).mockResolvedValue(spending);

    render(<CategoryLimitDisplay categoryId="cat-1" />);

    await waitFor(() => expect(screen.getByText('(50%)')).toBeInTheDocument());
    expect(categoriesApi.getSpending).toHaveBeenCalledWith('cat-1');
  });

  it('si la API falla, no muestra nada (sin crashear)', async () => {
    vi.mocked(categoriesApi.getSpending).mockRejectedValue(new Error('boom'));

    const { container } = render(<CategoryLimitDisplay categoryId="cat-1" />);

    await waitFor(() => expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument());
    expect(container).toBeEmptyDOMElement();
  });
});
