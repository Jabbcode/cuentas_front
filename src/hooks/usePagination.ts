import { useState } from 'react';
import { calculatePaginationInfo } from '../lib/transaction-utils';

export function usePagination(itemsPerPage: number = 20) {
  const [currentPage, setCurrentPage] = useState(1);

  const resetPage = () => setCurrentPage(1);

  const nextPage = () => setCurrentPage((p) => p + 1);

  const previousPage = () => setCurrentPage((p) => Math.max(1, p - 1));

  const goToPage = (page: number) => setCurrentPage(page);

  const getPaginationInfo = (total: number) => {
    return calculatePaginationInfo(currentPage, total, itemsPerPage);
  };

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
