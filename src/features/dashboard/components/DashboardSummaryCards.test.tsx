import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardSummaryCards } from './DashboardSummaryCards';
import type { DashboardSummary } from '../../../types';

describe('DashboardSummaryCards', () => {
  it('summary null: muestra 0,00 €', () => {
    render(<DashboardSummaryCards summary={null} />);
    expect(screen.getByText('0,00 €')).toBeInTheDocument();
  });

  it('muestra el balance total de la summary', () => {
    const summary: DashboardSummary = {
      totalBalance: 1234,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      monthlyNet: 0,
      month: 'enero 2026',
    };
    render(<DashboardSummaryCards summary={summary} />);
    expect(screen.getByText('1234,00 €')).toBeInTheDocument();
  });
});
