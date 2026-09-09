import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DebtsSummaryCard } from './DebtsSummaryCard';
import type { DebtsSummary } from '../../../types';

function makeSummary(overrides: Partial<DebtsSummary> = {}): DebtsSummary {
  return {
    totalActiveDebts: 0,
    totalOverdueDebts: 0,
    totalDebtAmount: 0,
    totalOverdueAmount: 0,
    debtsDueSoon: 0,
    upcomingDebts: [],
    ...overrides,
  };
}

function renderCard(summary: DebtsSummary) {
  return render(
    <MemoryRouter>
      <DebtsSummaryCard summary={summary} />
    </MemoryRouter>
  );
}

describe('DebtsSummaryCard', () => {
  it('sin deudas: muestra el estado "Sin Deudas Activas"', () => {
    renderCard(makeSummary());
    expect(screen.getByText('Sin Deudas Activas')).toBeInTheDocument();
  });

  it('con deudas activas sin alertas: muestra el conteo de activas', () => {
    renderCard(makeSummary({ totalActiveDebts: 2 }));
    expect(screen.getByText(/2 deudas activas/)).toBeInTheDocument();
  });

  it('con deudas vencidas: muestra la alerta roja con el monto vencido', () => {
    renderCard(makeSummary({ totalOverdueDebts: 1, totalOverdueAmount: 150 }));
    expect(screen.getByText(/1 deuda vencida/)).toBeInTheDocument();
    expect(screen.getByText(/150,00 €/)).toBeInTheDocument();
  });

  it('con deudas próximas a vencer: muestra la alerta amarilla', () => {
    renderCard(makeSummary({ totalActiveDebts: 1, debtsDueSoon: 1 }));
    expect(screen.getByText(/1 deuda próxima a vencer/)).toBeInTheDocument();
  });

  it('lista hasta 3 deudas próximas a vencer', () => {
    renderCard(
      makeSummary({
        totalActiveDebts: 1,
        upcomingDebts: [
          { id: 'd1', creditor: 'Banco A', description: 'Préstamo', remainingAmount: 100 },
        ],
      })
    );
    expect(screen.getByText('Banco A')).toBeInTheDocument();
  });

  it('con más de 3 deudas próximas: muestra el link "Ver X más"', () => {
    renderCard(
      makeSummary({
        totalActiveDebts: 4,
        upcomingDebts: [
          { id: 'd1', creditor: 'A', description: '', remainingAmount: 1 },
          { id: 'd2', creditor: 'B', description: '', remainingAmount: 1 },
          { id: 'd3', creditor: 'C', description: '', remainingAmount: 1 },
          { id: 'd4', creditor: 'D', description: '', remainingAmount: 1 },
        ],
      })
    );
    expect(screen.getByText('Ver 1 más')).toBeInTheDocument();
  });
});
