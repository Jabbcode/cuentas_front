import type { Transaction, Category } from '../../types';
import type { TransactionApiFilters } from './api';
import type { TransactionFilterState } from './types';

export interface GroupedTransaction {
  category: Pick<Category, 'id' | 'name' | 'icon' | 'color'>;
  transactions: Transaction[];
  total: number;
}

/**
 * Groups transactions by category and computes signed totals.
 */
export function groupTransactionsByCategory(transactions: Transaction[]): GroupedTransaction[] {
  const groups = new Map<string, GroupedTransaction>();

  transactions.forEach((tx) => {
    if (!tx.category) return;
    const key = tx.category.id;
    if (!groups.has(key)) {
      groups.set(key, { category: tx.category, transactions: [], total: 0 });
    }
    const group = groups.get(key)!;
    group.transactions.push(tx);
    group.total += Number(tx.amount) * (tx.type === 'income' ? 1 : -1);
  });

  return Array.from(groups.values()).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
}

/**
 * Computes pagination metadata from current state and total item count.
 */
export function calculatePaginationInfo(currentPage: number, total: number, itemsPerPage: number) {
  const totalPages = Math.ceil(total / itemsPerPage);
  const startItem = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, total);

  return {
    totalPages,
    startItem,
    endItem,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * Builds API filter params from UI filter state and pagination.
 */
export function buildTransactionApiFilters(params: {
  currentPage: number;
  itemsPerPage: number;
  startDate?: string;
  endDate?: string;
  accountId?: string;
  type?: 'all' | 'expense' | 'income';
  tag?: string;
}): TransactionApiFilters {
  const { currentPage, itemsPerPage, startDate, endDate, accountId, type, tag } = params;

  const filters: TransactionApiFilters = {
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  };

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    filters.startDate = start.toISOString();
    if (!endDate) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      filters.endDate = today.toISOString();
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filters.endDate = end.toISOString();
  }

  if (accountId && accountId !== 'all') {
    filters.accountId = accountId;
  }

  if (type && type !== 'all') {
    filters.type = type;
  }

  if (tag) {
    filters.tag = tag;
  }

  return filters;
}

/**
 * Applies client-side category and amount range filters to a transaction list.
 */
export function applyClientSideFilters(
  transactions: Transaction[],
  filters: Pick<TransactionFilterState, 'categoryIds' | 'minAmount' | 'maxAmount'>
): Transaction[] {
  let result = transactions;

  if (filters.categoryIds.length > 0) {
    result = result.filter((tx) => tx.category && filters.categoryIds.includes(tx.category.id));
  }

  const min = parseFloat(filters.minAmount);
  const max = parseFloat(filters.maxAmount);

  if (!isNaN(min)) {
    result = result.filter((tx) => Number(tx.amount) >= min);
  }
  if (!isNaN(max)) {
    result = result.filter((tx) => Number(tx.amount) <= max);
  }

  return result;
}

/**
 * Returns the default form data for creating a new transaction.
 */
export function getDefaultTransactionFormData(
  firstAccountId: string,
  defaultExpenseCategoryId: string
) {
  return {
    amount: '',
    type: 'expense' as const,
    description: '',
    date: new Date().toISOString().split('T')[0],
    accountId: firstAccountId,
    categoryId: defaultExpenseCategoryId,
    imageHash: undefined as string | undefined,
    tagNames: [] as string[],
    receiptItems: [] as Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>,
  };
}

/**
 * Returns true when at least one UI filter is active.
 */
export function hasActiveFilters(filters: TransactionFilterState): boolean {
  return (
    filters.startDate !== '' ||
    filters.endDate !== '' ||
    filters.categoryIds.length > 0 ||
    filters.accountId !== 'all' ||
    filters.minAmount !== '' ||
    filters.maxAmount !== '' ||
    filters.type !== 'all' ||
    filters.tag !== ''
  );
}

export const DEFAULT_FILTER_STATE: TransactionFilterState = {
  startDate: '',
  endDate: '',
  categoryIds: [],
  accountId: 'all',
  minAmount: '',
  maxAmount: '',
  type: 'all',
  groupByCategory: false,
  tag: '',
};
