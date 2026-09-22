import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalysisPage } from './AnalysisPage';
import { useAnalysisPage } from '../features/analysis/hooks/useAnalysisPage';
import type { UseAnalysisPageReturn } from '../features/analysis/hooks/useAnalysisPage';

vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../features/analysis/hooks/useAnalysisPage');
const mockedUseAnalysisPage = vi.mocked(useAnalysisPage);

function baseReturn(overrides: Partial<UseAnalysisPageReturn> = {}): UseAnalysisPageReturn {
  return {
    draftRange: { startDate: '2026-01-01', endDate: '2026-01-31' },
    appliedRange: { startDate: '2026-01-01', endDate: '2026-01-31' },
    rangeError: null,
    type: 'expense',
    accountId: 'all',
    accounts: [],
    selectedCategoryIds: [],
    isSelectionFull: false,
    months: [],
    series: [],
    loading: false,
    emptyState: 'no-data',
    setDraftStartDate: vi.fn(),
    setDraftEndDate: vi.fn(),
    setType: vi.fn(),
    setAccountId: vi.fn(),
    toggleCategory: vi.fn(),
    onPointClick: vi.fn(),
    reload: vi.fn(),
    ...overrides,
  };
}

describe('AnalysisPage', () => {
  it('muestra el título y los filtros', () => {
    mockedUseAnalysisPage.mockReturnValue(baseReturn());

    render(<AnalysisPage />);

    expect(screen.getByText('Análisis')).toBeInTheDocument();
    expect(screen.getByLabelText('Desde')).toHaveValue('2026-01-01');
    expect(screen.getByLabelText('Hasta')).toHaveValue('2026-01-31');
  });

  it('con series y categorías, muestra el multiselect de categorías', () => {
    mockedUseAnalysisPage.mockReturnValue(
      baseReturn({
        emptyState: null,
        months: ['2026-01'],
        series: [
          {
            category: { id: 'cat-1', name: 'Comida', icon: null, color: null },
            total: 100,
            points: [{ month: '2026-01', total: 100, count: 1 }],
          },
        ],
        selectedCategoryIds: ['cat-1'],
      })
    );

    render(<AnalysisPage />);

    expect(screen.getByText('Comida')).toBeInTheDocument();
  });

  it('sin datos: muestra el estado vacío de la gráfica', () => {
    mockedUseAnalysisPage.mockReturnValue(baseReturn({ emptyState: 'no-data' }));

    render(<AnalysisPage />);

    expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument();
  });
});
