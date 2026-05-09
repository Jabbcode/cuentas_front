import { useState, useCallback } from 'react';
import { calculatePaginationInfo } from '../features/transactions/utils';

export function usePagination(itemsPerPage: number = 20) {
  const [currentPage, setCurrentPage] = useState(1);

  const resetPage = useCallback(() => setCurrentPage(1), []);
  const nextPage = useCallback(() => setCurrentPage((p) => p + 1), []);
  const previousPage = useCallback(() => setCurrentPage((p) => Math.max(1, p - 1)), []);
  const goToPage = useCallback((page: number) => setCurrentPage(page), []);

  const getPaginationInfo = useCallback(
    (total: number) => calculatePaginationInfo(currentPage, total, itemsPerPage),
    [currentPage, itemsPerPage]
  );

  return {
    currentPage,
    itemsPerPage,
    resetPage,
    nextPage,
    previousPage,
    goToPage,
    getPaginationInfo,
  };
}
