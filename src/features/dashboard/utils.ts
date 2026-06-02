import type {
  MonthlySummary,
  CategoryComparison,
  FixedExpense,
  FixedExpenseSummary,
  CreditCardsSummary,
  DebtsSummary,
} from '../../types';

export function getPrevMonth(month: number, year: number): { month: number; year: number } {
  if (month === 1) return { month: 12, year: year - 1 };
  return { month: month - 1, year };
}

export function calcDiffPct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function mergeCategories(
  current: MonthlySummary,
  previous: MonthlySummary
): CategoryComparison[] {
  const map = new Map<string, CategoryComparison>();

  current.categories.forEach((cat) => {
    map.set(cat.id, {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      current: cat.total,
      previous: 0,
      diff: cat.total,
      diffPercentage: null,
      trend: 'up',
    });
  });

  previous.categories.forEach((cat) => {
    if (map.has(cat.id)) {
      const entry = map.get(cat.id)!;
      const diff = entry.current - cat.total;
      map.set(cat.id, {
        ...entry,
        previous: cat.total,
        diff,
        diffPercentage: calcDiffPct(entry.current, cat.total),
        trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
      });
    } else {
      map.set(cat.id, {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        current: 0,
        previous: cat.total,
        diff: -cat.total,
        diffPercentage: -100,
        trend: 'down',
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => b.current - a.current);
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const CREDIT_UTILIZATION_ALERT_THRESHOLD = 0.8;
export const UPCOMING_PAYMENTS_DAYS_WINDOW = 7;

// ─── DashboardHeroCard derivations ───────────────────────────────────────────

export function calcDaysLeftInMonth(): number {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return lastDay - today.getDate();
}

export function calcSpentPercentage(expenses: number, income: number): number {
  if (income === 0) return 0;
  return (expenses / income) * 100;
}

// ─── Alert logic ─────────────────────────────────────────────────────────────

export function calcDaysUntilDueDay(dueDay: number): number {
  if (dueDay < 1 || dueDay > 31) return Infinity;
  const today = new Date();
  const currentDay = today.getDate();
  if (dueDay >= currentDay) return dueDay - currentDay;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return daysInMonth - currentDay + dueDay;
}

export function filterUpcomingFixedExpenses(
  items: (FixedExpense & { isPaidThisMonth: boolean })[],
  windowDays: number
): (FixedExpense & { isPaidThisMonth: boolean })[] {
  return items.filter(
    (item) => !item.isPaidThisMonth && calcDaysUntilDueDay(item.dueDay) <= windowDays
  );
}

export function hasAlerts(
  debtsSummary: DebtsSummary | null,
  creditCardsSummary: CreditCardsSummary | null,
  fixedSummary: FixedExpenseSummary | null
): boolean {
  if (debtsSummary && debtsSummary.totalOverdueDebts > 0) return true;

  if (creditCardsSummary) {
    const hasHighUtilization = creditCardsSummary.cards.some(
      (card) => card.usagePercentage > CREDIT_UTILIZATION_ALERT_THRESHOLD
    );
    if (hasHighUtilization) return true;

    const hasUpcomingCreditPayments = creditCardsSummary.upcomingPayments.some(
      (p) => p.daysUntilDue <= UPCOMING_PAYMENTS_DAYS_WINDOW
    );
    if (hasUpcomingCreditPayments) return true;
  }

  if (fixedSummary) {
    const upcoming = filterUpcomingFixedExpenses(fixedSummary.items, UPCOMING_PAYMENTS_DAYS_WINDOW);
    if (upcoming.length > 0) return true;
  }

  return false;
}
