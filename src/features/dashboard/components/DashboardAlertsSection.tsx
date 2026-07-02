import { AlertCircle, CreditCard, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';
import {
  hasAlerts,
  filterUpcomingFixedExpenses,
  UPCOMING_PAYMENTS_DAYS_WINDOW,
  CREDIT_UTILIZATION_ALERT_THRESHOLD,
} from '../utils';
import type { DebtsSummary, CreditCardsSummary, FixedExpenseSummary } from '../../../types';

interface DashboardAlertsSectionProps {
  debtsSummary: DebtsSummary | null;
  creditCardsSummary: CreditCardsSummary | null;
  fixedSummary: FixedExpenseSummary | null;
  isOpen: boolean;
  onToggle: () => void;
}

export function DashboardAlertsSection({
  debtsSummary,
  creditCardsSummary,
  fixedSummary,
  isOpen,
  onToggle,
}: DashboardAlertsSectionProps) {
  if (!hasAlerts(debtsSummary, creditCardsSummary, fixedSummary)) {
    return null;
  }

  const overdueDebts = debtsSummary ? debtsSummary.totalOverdueDebts : 0;

  const highUtilizationCards = creditCardsSummary
    ? creditCardsSummary.cards.filter(
        (card) => card.usagePercentage > CREDIT_UTILIZATION_ALERT_THRESHOLD
      )
    : [];

  const upcomingCreditPayments = creditCardsSummary
    ? creditCardsSummary.upcomingPayments.filter(
        (p) => p.daysUntilDue <= UPCOMING_PAYMENTS_DAYS_WINDOW
      )
    : [];

  const upcomingFixed = fixedSummary
    ? filterUpcomingFixedExpenses(fixedSummary.items, UPCOMING_PAYMENTS_DAYS_WINDOW)
    : [];

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-left text-sm font-medium text-yellow-900 hover:bg-yellow-100"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-700" />
          <span>Atención requerida</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-yellow-700" />
        ) : (
          <ChevronDown className="h-4 w-4 text-yellow-700" />
        )}
      </button>
      {isOpen && (
        <div className="space-y-2">
          {overdueDebts > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  {overdueDebts} deuda{overdueDebts !== 1 ? 's' : ''} vencida
                  {overdueDebts !== 1 ? 's' : ''}
                </p>
                {debtsSummary && debtsSummary.totalOverdueAmount > 0 && (
                  <p className="text-xs text-red-700 mt-0.5">
                    Total vencido: {formatCurrency(debtsSummary.totalOverdueAmount)}
                  </p>
                )}
              </div>
            </div>
          )}

          {highUtilizationCards.map((card) => (
            <div
              key={card.account.id}
              className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3"
            >
              <CreditCard className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  {card.account.name} — uso al {Math.round(card.usagePercentage * 100)}%
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Disponible: {formatCurrency(card.available)}
                </p>
              </div>
            </div>
          ))}

          {upcomingCreditPayments.map((payment) => (
            <div
              key={payment.accountId}
              className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3"
            >
              <Calendar className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  Pago {payment.accountName} en {payment.daysUntilDue} día
                  {payment.daysUntilDue !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-yellow-700 mt-0.5">{formatCurrency(payment.amount)}</p>
              </div>
            </div>
          ))}

          {upcomingFixed.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3"
            >
              <Calendar className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  {item.name} vence el día {item.dueDay}
                </p>
                <p className="text-xs text-yellow-700 mt-0.5">{formatCurrency(item.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
