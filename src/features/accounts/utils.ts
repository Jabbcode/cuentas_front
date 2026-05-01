import type { Account, CreditCardStatement } from '../../types';
import type { AccountFormData, AccountPayload } from './types';

export function groupAccountsByType(accounts: Account[]): Record<Account['type'], Account[]> {
  return accounts.reduce(
    (acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = [];
      }
      acc[account.type].push(account);
      return acc;
    },
    {} as Record<Account['type'], Account[]>
  );
}

export function buildAccountPayload(formData: AccountFormData): AccountPayload {
  const payload: AccountPayload = {
    name: formData.name,
    type: formData.type,
    balance: parseFloat(formData.balance),
    currency: formData.currency,
    color: formData.color,
  };

  if (formData.type === 'credit_card') {
    if (formData.creditLimit) payload.creditLimit = parseFloat(formData.creditLimit);
    if (formData.cutoffDay) payload.cutoffDay = parseInt(formData.cutoffDay, 10);
    if (formData.paymentDueDay) payload.paymentDueDay = parseInt(formData.paymentDueDay, 10);
    if (formData.paymentAccountId) payload.paymentAccountId = formData.paymentAccountId;
  }

  return payload;
}

export function calculateBalanceTotals(
  accounts: Account[],
  statementsMap: Record<string, CreditCardStatement>
): { totalBalance: number; unpaidClosedTotal: number } {
  let total = 0;
  let unpaid = 0;

  for (const acc of accounts) {
    if (acc.type === 'credit_card' && acc.creditLimit) {
      const stmt = statementsMap[acc.id];
      if (stmt) {
        total += stmt.creditLimit - stmt.currentPeriod.balance;
        if (!stmt.closedPeriod.isPaid && stmt.closedPeriod.balance > 0) {
          total -= stmt.closedPeriod.balance;
          unpaid += stmt.closedPeriod.balance;
        }
      } else {
        total += acc.creditLimit - Math.abs(Number(acc.balance));
      }
    } else {
      total += Number(acc.balance);
    }
  }

  return { totalBalance: total, unpaidClosedTotal: unpaid };
}
