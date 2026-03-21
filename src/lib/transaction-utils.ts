import type { Transaction, Category } from '../types';

export interface GroupedTransaction {
  category: Pick<Category, 'id' | 'name' | 'icon' | 'color'>;
  transactions: Transaction[];
  total: number;
}

/**
 * Agrupa transacciones por categoría y calcula totales
 */
export function groupTransactionsByCategory(
  transactions: Transaction[]
): GroupedTransaction[] {
  const groups = new Map<string, GroupedTransaction>();

  transactions.forEach((tx) => {
    if (!tx.category) return;

    const key = tx.category.id;
    if (!groups.has(key)) {
      groups.set(key, {
        category: tx.category,
        transactions: [],
        total: 0,
      });
    }

    const group = groups.get(key)!;
    group.transactions.push(tx);
    group.total += Number(tx.amount) * (tx.type === 'income' ? 1 : -1);
  });

  // Sort by absolute value of total (highest first)
  return Array.from(groups.values()).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
}

/**
 * Calcula información de paginación
 */
export function calculatePaginationInfo(
  currentPage: number,
  total: number,
  itemsPerPage: number
) {
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
 * Construye filtros para la API de transacciones
 */
export function buildTransactionFilters(params: {
  currentPage: number;
  itemsPerPage: number;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: 'all' | 'expense' | 'income';
}) {
  const { currentPage, itemsPerPage, startDate, endDate, categoryId, type } = params;

  const filters: any = {
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  };

  // Date filters
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    filters.startDate = start.toISOString();

    // If start date but no end date, use today as end
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

  // Category filter
  if (categoryId && categoryId !== 'all') {
    filters.categoryId = categoryId;
  }

  // Type filter
  if (type && type !== 'all') {
    filters.type = type;
  }

  return filters;
}
