import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../api';
import { useTransactions } from './useTransactions';
import { useTransactionFilters } from './useTransactionFilters';
import { useTransactionSummary } from './useTransactionSummary';
import { usePagination } from '../../../hooks/usePagination';
import { useAccounts } from '../../accounts/hooks/useAccounts';
import { useCategories } from '../../categories/hooks/useCategories';
import { toast } from 'sonner';
import { getClosedPeriodWarning } from '../../../lib/credit-card-utils';
import { getApiErrorMessage } from '../../../lib/api-errors';
import { logger } from '../../../lib/logger';
import type { Transaction } from '../../../types';
import type { ScanReceiptData } from '../../../api/receipts.api';
import type { TransactionFormData, TransactionEditInput, DateWarning } from '../types';
import type { TransactionFilters } from './useTransactionFilters';
import type { TransactionCategorySummaryItem } from '../api';

const ITEMS_PER_PAGE = 20;

export interface UseTransactionsPageReturn {
  // Data
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  total: number;
  accounts: ReturnType<typeof useAccounts>['accounts'];
  categories: ReturnType<typeof useCategories>['categories'];
  categorySummary: TransactionCategorySummaryItem[];

  // Loading states
  loading: boolean;
  categorySummaryLoading: boolean;
  saving: boolean;
  deleting: boolean;
  loadingItemsId: string | null;

  // UI state
  showForm: boolean;
  showScanner: boolean;
  showCategorySummary: boolean;
  deleteId: string | null;
  editingTransaction: Transaction | null;
  viewingItems: Transaction | null;

  // Form state
  formData: TransactionFormData;
  filters: TransactionFilters;
  filteredCategories: ReturnType<typeof useCategories>['categories'];
  dateWarning: DateWarning;
  hasActiveFilters: boolean;

  // Handlers — ui toggles (extended)
  setShowCategorySummary: (show: boolean) => void;

  // Pagination
  currentPage: number;
  paginationInfo: ReturnType<ReturnType<typeof usePagination>['getPaginationInfo']>;
  itemsPerPage: number;

  // Handlers — filters
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  toggleCategory: (categoryId: string) => void;
  removeCategory: (categoryId: string) => void;
  setAccountId: (accountId: string) => void;
  setMinAmount: (amount: string) => void;
  setMaxAmount: (amount: string) => void;
  setType: (type: 'all' | 'expense' | 'income') => void;
  clearFilters: () => void;

  // Handlers — pagination
  nextPage: () => void;
  previousPage: () => void;

  // Handlers — modal/form
  handleOpenForm: () => void;
  handleCloseForm: () => void;
  handleTypeChange: (type: 'expense' | 'income') => void;
  handleFormDataChange: (patch: Partial<TransactionFormData>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleScannedReceipt: (scannedData: ScanReceiptData) => void;
  handleEdit: (transaction: Transaction) => void;
  handleSaveEdit: (id: string, data: TransactionEditInput) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleViewItems: (transaction: Transaction) => Promise<void>;

  // Handlers — ui toggles
  setDeleteId: (id: string | null) => void;
  setShowScanner: (show: boolean) => void;
  setEditingTransaction: (tx: Transaction | null) => void;
  setViewingItems: (tx: Transaction | null) => void;
  reload: () => void;
  loadError: string | null;
}

export function useTransactionsPage(): UseTransactionsPageReturn {
  const queryClient = useQueryClient();

  // 1. Pagination — decoupled
  const pagination = usePagination(ITEMS_PER_PAGE);

  // 2. Filters — decoupled, resets page on any filter change
  const filterHook = useTransactionFilters(pagination.resetPage);

  // 3. Transactions — server-side filtered and paginated
  const {
    transactions,
    total,
    loading,
    reload,
    error: loadError,
  } = useTransactions({
    currentPage: pagination.currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    startDate: filterHook.filters.startDate || undefined,
    endDate: filterHook.filters.endDate || undefined,
    accountId: filterHook.filters.accountId !== 'all' ? filterHook.filters.accountId : undefined,
    type: filterHook.filters.type,
    categoryIds:
      filterHook.filters.categoryIds.length > 0 ? filterHook.filters.categoryIds : undefined,
    minAmount: filterHook.filters.minAmount || undefined,
    maxAmount: filterHook.filters.maxAmount || undefined,
  });

  // 4. Reference data — fetched once, independent of filters/pagination
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  // 5. Category summary — only fetched when modal is open
  const [showCategorySummary, setShowCategorySummary] = useState(false);
  const { summary: categorySummary, loading: categorySummaryLoading } = useTransactionSummary(
    {
      startDate: filterHook.filters.startDate || undefined,
      endDate: filterHook.filters.endDate || undefined,
      accountId: filterHook.filters.accountId !== 'all' ? filterHook.filters.accountId : undefined,
      type: filterHook.filters.type !== 'all' ? filterHook.filters.type : undefined,
    },
    showCategorySummary
  );

  // Modal/UI state
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [viewingItems, setViewingItems] = useState<Transaction | null>(null);
  const [loadingItemsId, setLoadingItemsId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: '',
    type: 'expense',
    description: '',
    date: new Date().toISOString().split('T')[0],
    accountId: '',
    categoryId: '',
    imageHash: undefined,
    receiptItems: [],
  });

  // Derived: pagination info
  const paginationInfo = useMemo(() => pagination.getPaginationInfo(total), [pagination, total]);

  // Derived: categories for form filtered by current type
  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === formData.type),
    [categories, formData.type]
  );

  // Derived: credit card date warning
  const dateWarning: DateWarning = useMemo(() => {
    if (!formData.accountId || !formData.date || formData.type !== 'expense') return null;
    const account = accounts.find((acc) => acc.id === formData.accountId);
    return getClosedPeriodWarning(formData.date, account);
  }, [formData.accountId, formData.date, formData.type, accounts]);

  // Helpers
  const buildInitialFormData = useCallback((): TransactionFormData => {
    return {
      amount: '',
      type: 'expense',
      description: '',
      date: new Date().toISOString().split('T')[0],
      accountId: accounts.length > 0 ? accounts[0].id : '',
      categoryId: categories.find((c) => c.type === 'expense')?.id ?? '',
      imageHash: undefined,
      receiptItems: [],
    };
  }, [accounts, categories]);

  // Form handlers
  const handleOpenForm = useCallback(() => {
    setFormData(buildInitialFormData());
    setShowForm(true);
  }, [buildInitialFormData]);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setFormData(buildInitialFormData());
  }, [buildInitialFormData]);

  const handleTypeChange = useCallback(
    (type: 'expense' | 'income') => {
      const defaultCat = categories.find((c) => c.type === type);
      setFormData((prev) => ({ ...prev, type, categoryId: defaultCat?.id ?? '' }));
    },
    [categories]
  );

  const handleFormDataChange = useCallback((patch: Partial<TransactionFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
        await transactionsApi.create({
          amount: parseFloat(formData.amount),
          type: formData.type,
          description: formData.description || undefined,
          date: new Date(formData.date).toISOString(),
          accountId: formData.accountId,
          categoryId: formData.categoryId,
          imageHash: formData.imageHash || undefined,
          receiptItems: formData.receiptItems.length > 0 ? formData.receiptItems : undefined,
        });
        logger.info('transaction', 'Transaction created', {
          type: formData.type,
          description: formData.description,
        });
        handleCloseForm();
        await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'No se pudo guardar la transacción'));
        logger.error('transaction', 'Failed to create transaction', err);
      } finally {
        setSaving(false);
      }
    },
    [formData, handleCloseForm, queryClient]
  );

  const handleScannedReceipt = useCallback(
    (scannedData: ScanReceiptData) => {
      let categoryId = formData.categoryId;
      if (scannedData.suggestedCategory) {
        const matched = categories.find(
          (c) =>
            c.type === 'expense' &&
            c.name.toLowerCase() === scannedData.suggestedCategory?.toLowerCase()
        );
        if (matched) categoryId = matched.id;
      }

      setFormData({
        amount: scannedData.amount.toString(),
        type: 'expense',
        description: scannedData.description,
        date: scannedData.date,
        accountId: accounts.length > 0 ? accounts[0].id : '',
        categoryId,
        imageHash: scannedData.imageHash,
        receiptItems: scannedData.items ?? [],
      });

      setShowForm(true);
    },
    [accounts, categories, formData.categoryId]
  );

  const handleEdit = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
  }, []);

  const handleSaveEdit = useCallback(
    async (id: string, data: TransactionEditInput) => {
      try {
        await transactionsApi.update(id, {
          description: data.description || undefined,
          categoryId: data.categoryId,
          date: new Date(data.date).toISOString(),
          amount: parseFloat(data.amount),
        });
        logger.info('transaction', 'Transaction updated', { id });
        setEditingTransaction(null);
        await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'No se pudo actualizar la transacción'));
        logger.error('transaction', 'Failed to update transaction', err, { id });
      }
    },
    [queryClient]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await transactionsApi.delete(deleteId);
      logger.info('transaction', 'Transaction deleted', { id: deleteId });
      setDeleteId(null);
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (err) {
      toast.error('No se pudo eliminar la transacción');
      logger.error('transaction', 'Failed to delete transaction', err, { id: deleteId });
    } finally {
      setDeleting(false);
    }
  }, [deleteId, queryClient]);

  const handleViewItems = useCallback(async (transaction: Transaction) => {
    if (transaction.receiptItems && transaction.receiptItems.length > 0) {
      setViewingItems(transaction);
      return;
    }
    setLoadingItemsId(transaction.id);
    try {
      const items = await transactionsApi.getReceiptItems(transaction.id);
      setViewingItems({ ...transaction, receiptItems: items });
    } catch {
      toast.error('No se pudieron cargar los ítems del recibo');
    } finally {
      setLoadingItemsId(null);
    }
  }, []);

  return {
    // Data
    transactions,
    filteredTransactions: transactions,
    total,
    accounts,
    categories,
    categorySummary,

    // Loading states
    loading,
    categorySummaryLoading,
    saving,
    deleting,
    loadingItemsId,

    // UI state
    showForm,
    showScanner,
    showCategorySummary,
    deleteId,
    editingTransaction,
    viewingItems,

    // Form / filter state
    formData,
    filters: filterHook.filters,
    filteredCategories,
    dateWarning,
    hasActiveFilters: filterHook.hasActiveFilters,

    // Pagination
    currentPage: pagination.currentPage,
    paginationInfo,
    itemsPerPage: ITEMS_PER_PAGE,

    // Filter handlers
    setStartDate: filterHook.setStartDate,
    setEndDate: filterHook.setEndDate,
    toggleCategory: filterHook.toggleCategory,
    removeCategory: filterHook.removeCategory,
    setAccountId: filterHook.setAccountId,
    setMinAmount: filterHook.setMinAmount,
    setMaxAmount: filterHook.setMaxAmount,
    setType: filterHook.setType,
    clearFilters: filterHook.clearFilters,

    // Pagination handlers
    nextPage: pagination.nextPage,
    previousPage: pagination.previousPage,

    // Modal/form handlers
    handleOpenForm,
    handleCloseForm,
    handleTypeChange,
    handleFormDataChange,
    handleSubmit,
    handleScannedReceipt,
    handleEdit,
    handleSaveEdit,
    handleDelete,
    handleViewItems,

    // UI toggles
    setDeleteId,
    setShowScanner,
    setShowCategorySummary,
    setEditingTransaction,
    setViewingItems,
    reload,
    loadError,
  };
}
