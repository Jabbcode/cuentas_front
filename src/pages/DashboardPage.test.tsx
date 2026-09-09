import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('recharts', () => ({
  BarChart: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockUseDashboard = vi.fn();
const mockUseDashboardPage = vi.fn();
vi.mock('../features/dashboard', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../features/dashboard')>();
  return {
    ...actual,
    useDashboard: () => mockUseDashboard(),
    useDashboardPage: () => mockUseDashboardPage(),
  };
});

import { DashboardPage } from './DashboardPage';

function baseDashboard(overrides: Partial<ReturnType<typeof mockUseDashboard>> = {}) {
  return {
    summary: null,
    fixedSummary: null,
    projection: null,
    creditCardsSummary: null,
    debtsSummary: null,
    monthlyTrend: [],
    trendLoading: false,
    loading: false,
    reload: vi.fn(),
    ...overrides,
  };
}

function basePage(overrides: Partial<ReturnType<typeof mockUseDashboardPage>> = {}) {
  return {
    isAlertsOpen: false,
    isCreditCardsOpen: false,
    isDebtsOpen: false,
    isFixedOpen: false,
    isProjectionOpen: false,
    toggleAlerts: vi.fn(),
    toggleCreditCards: vi.fn(),
    toggleDebts: vi.fn(),
    toggleFixed: vi.fn(),
    toggleProjection: vi.fn(),
    ...overrides,
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );
}

describe('DashboardPage', () => {
  it('loading: muestra el spinner', () => {
    mockUseDashboard.mockReturnValue(baseDashboard({ loading: true }));
    mockUseDashboardPage.mockReturnValue(basePage());
    renderPage();

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('con datos: muestra el título y el balance neto', () => {
    mockUseDashboard.mockReturnValue(
      baseDashboard({
        summary: {
          totalBalance: 0,
          monthlyIncome: 0,
          monthlyExpenses: 0,
          monthlyNet: 0,
          month: 'enero 2026',
        },
      })
    );
    mockUseDashboardPage.mockReturnValue(basePage());
    renderPage();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Balance neto del mes')).toBeInTheDocument();
  });

  it('click en Actualizar llama a reload', async () => {
    const user = userEvent.setup();
    const reload = vi.fn();
    mockUseDashboard.mockReturnValue(baseDashboard({ reload }));
    mockUseDashboardPage.mockReturnValue(basePage());
    renderPage();

    await user.click(screen.getByRole('button', { name: /Actualizar/ }));

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('con creditCardsSummary: la sección de tarjetas es colapsable', async () => {
    const user = userEvent.setup();
    const toggleCreditCards = vi.fn();
    mockUseDashboard.mockReturnValue(
      baseDashboard({
        creditCardsSummary: { totalToPay: 0, upcomingPayments: [], alerts: [], cards: [] },
      })
    );
    mockUseDashboardPage.mockReturnValue(basePage({ toggleCreditCards }));
    renderPage();

    await user.click(screen.getByText('Tarjetas de crédito'));

    expect(toggleCreditCards).toHaveBeenCalledTimes(1);
  });
});
