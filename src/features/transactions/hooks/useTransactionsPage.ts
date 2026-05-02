import { useState, useCallback, useMemo } from 'react';
import { transactionsApi } from '../api';
import { useTransactions } from './useTransactions';
import {
  applyClientSideFilters,
  groupTransactionsByCategory,
  calculatePaginationInfo,
  getDefaultTransactionFormData,
  hasActiveFilters,
  DEFAULT_FILTER_STATE,
} from '../utils';
import { useTags, useTagsSummary } from '../../../hooks/useTags';
import { getClosedPeriodWarning } from '../../../lib/credit-card-utils';
import type { Transaction } from '../../../types';
import type { ScanReceiptData } from '../../../api/receipts.api';
import type {
  TransactionFormData,
  TransactionFilterState,
  TransactionEditInput,
  DateWarning,
} from '../types';

const ITEMS_PER_PAGE = 20;

export interface UseTransactionsPageReturn {
  // Data
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  groupedTransactions: ReturnType<typeof groupTransactionsByCategory> | null;
  total: number;
  accounts: ReturnType<typeof useTransactions>['accounts'];
  categories: ReturnType<typeof useTransactions>['categories'];
  availableTags: ReturnType<typeof useTags>['tags'];
  tagSummary: ReturnType<typeof useTagsSummary>['summary'];

  // Loading states
  loading: boolean;
  tagSummaryLoading: boolean;
  saving: boolean;
  deleting: boolean;
  loadingItemsId: string | null;

  // UI state
  showForm: boolean;
  showScanner: boolean;
  showTagSummary: boolean;
  deleteId: string | null;
  editingTransaction: Transaction | null;
  viewingItems: Transaction | null;

  // Form state
  formData: TransactionFormData;
  filters: TransactionFilterState;
  filteredCategories: ReturnType<typeof useTransactions>['categories'];
  dateWarning: DateWarning;
  hasActiveFilters: boolean;

  // Pagination
  currentPage: number;
  paginationInfo: ReturnType<typeof calculatePaginationInfo>;
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
  setGroupByCategory: (grouped: boolean) => void;
  setTag: (tag: string) => void;
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
  setShowTagSummary: (show: boolean) => void;
  setEditingTransaction: (tx: Transaction | null) => void;
  setViewingItems: (tx: Transaction | null) => void;
  reloadTagSummary: () => void;
}

export function useTransactionsPage(): UseTransactionsPageReturn {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const resetPage = useCallback(() => setCurrentPage(1), []);

  // Filter state
  const [filters, setFilters] = useState<TransactionFilterState>(DEFAULT_FILTER_STATE);

  // Modal/UI state
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showTagSummary, setShowTagSummary] = useState(false);
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
    tagNames: [],
    receiptItems: [],
  });

  // Server data
  const { transactions, total, accounts, categories, loading, reload } = useTransactions({
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    startDate: filters.startDate,
    endDate: filters.endDate,
    accountId: filters.accountId !== 'all' ? filters.accountId : undefined,
    type: filters.type,
    tag: filters.tag || undefined,
  });

  const { tags: availableTags, reload: reloadTags } = useTags();
  const {
    summary: tagSummary,
    loading: tagSummaryLoading,
    reload: reloadTagSummary,
  } = useTagsSummary();

  // Derived: client-side filtered transactions
  const filteredTransactions = useMemo(
    () =>
      applyClientSideFilters(transactions, {
        categoryIds: filters.categoryIds,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount,
      }),
    [transactions, filters.categoryIds, filters.minAmount, filters.maxAmount]
  );

  // Derived: grouped transactions
  const groupedTransactions = useMemo(() => {
    if (!filters.groupByCategory) return null;
    return groupTransactionsByCategory(filteredTransactions);
  }, [filteredTransactions, filters.groupByCategory]);

  // Derived: pagination info
  const paginationInfo = useMemo(
    () => calculatePaginationInfo(currentPage, total, ITEMS_PER_PAGE),
    [currentPage, total]
  );

  // Derived: filtered categories for form
  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === formData.type),
    [categories, formData.type]
  );

  // Derived: date warning for credit card
  const dateWarning: DateWarning = useMemo(() => {
    if (!formData.accountId || !formData.date || formData.type !== 'expense') return null;
    const account = accounts.find((acc) => acc.id === formData.accountId);
    return getClosedPeriodWarning(formData.date, account);
  }, [formData.accountId, formData.date, formData.type, accounts]);

  // Derived: hasActiveFilters
  const activeFilters = useMemo(() => hasActiveFilters(filters), [filters]);

  // Helpers
  const buildInitialFormData = useCallback((): TransactionFormData => {
    return getDefaultTransactionFormData(
      accounts.length > 0 ? accounts[0].id : '',
      categories.find((c) => c.type === 'expense')?.id ?? ''
    );
  }, [accounts, categories]);

  // Filter handlers
  const withResetPage = useCallback(
    <T>(setter: (val: T) => void) =>
      (val: T) => {
        setter(val);
        resetPage();
      },
    [resetPage]
  );

  const setStartDate = useCallback(
    withResetPage((date: string) => setFilters((prev) => ({ ...prev, startDate: date }))),
    [withResetPage]
  );

  const setEndDate = useCallback(
    withResetPage((date: string) => setFilters((prev) => ({ ...prev, endDate: date }))),
    [withResetPage]
  );

  const toggleCategory = useCallback(
    withResetPage((categoryId: string) =>
      setFilters((prev) => {
        const exists = prev.categoryIds.includes(categoryId);
        return {
          ...prev,
          categoryIds: exists
            ? prev.categoryIds.filter((id) => id !== categoryId)
            : [...prev.categoryIds, categoryId],
        };
      })
    ),
    [withResetPage]
  );

  const removeCategory = useCallback(
    withResetPage((categoryId: string) =>
      setFilters((prev) => ({
        ...prev,
        categoryIds: prev.categoryIds.filter((id) => id !== categoryId),
      }))
    ),
    [withResetPage]
  );

  const setAccountId = useCallback(
    withResetPage((accountId: string) => setFilters((prev) => ({ ...prev, accountId }))),
    [withResetPage]
  );

  const setMinAmount = useCallback((minAmount: string) => {
    setFilters((prev) => ({ ...prev, minAmount }));
  }, []);

  const setMaxAmount = useCallback((maxAmount: string) => {
    setFilters((prev) => ({ ...prev, maxAmount }));
  }, []);

  const setType = useCallback(
    withResetPage((type: 'all' | 'expense' | 'income') =>
      setFilters((prev) => ({ ...prev, type }))
    ),
    [withResetPage]
  );

  const setGroupByCategory = useCallback((groupByCategory: boolean) => {
    setFilters((prev) => ({ ...prev, groupByCategory }));
  }, []);

  const setTag = useCallback(
    withResetPage((tag: string) => setFilters((prev) => ({ ...prev, tag }))),
    [withResetPage]
  );

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
    resetPage();
  }, [resetPage]);

  // Pagination handlers
  const nextPage = useCallback(() => setCurrentPage((p) => p + 1), []);
  const previousPage = useCallback(() => setCurrentPage((p) => Math.max(1, p - 1)), []);

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
          tagNames: formData.tagNames.length > 0 ? formData.tagNames : undefined,
          receiptItems: formData.receiptItems.length > 0 ? formData.receiptItems : undefined,
        });
        handleCloseForm();
        reloadTags();
        reloadTagSummary();
        reload();
      } catch (err) {
        console.error('Error creating transaction:', err);
      } finally {
        setSaving(false);
      }
    },
    [formData, handleCloseForm, reload, reloadTags, reloadTagSummary]
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
        tagNames: [],
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
      await transactionsApi.update(id, {
        description: data.description || undefined,
        categoryId: data.categoryId,
        date: new Date(data.date).toISOString(),
        amount: parseFloat(data.amount),
        tagNames: data.tagNames,
      });
      setEditingTransaction(null);
      reloadTags();
      reloadTagSummary();
      reload();
    },
    [reload, reloadTags, reloadTagSummary]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await transactionsApi.delete(deleteId);
      setDeleteId(null);
      reload();
    } catch (err) {
      console.error('Error deleting transaction:', err);
    } finally {
      setDeleting(false);
    }
  }, [deleteId, reload]);

  const handleViewItems = useCallback(async (transaction: Transaction) => {
    if (transaction.receiptItems && transaction.receiptItems.length > 0) {
      setViewingItems(transaction);
      return;
    }
    setLoadingItemsId(transaction.id);
    try {
      const items = await transactionsApi.getReceiptItems(transaction.id);
      setViewingItems({ ...transaction, receiptItems: items });
    } catch (error) {
      console.error('Error loading receipt items:', error);
    } finally {
      setLoadingItemsId(null);
    }
  }, []);

  return {
    // Data
    transactions,
    filteredTransactions,
    groupedTransactions,
    total,
    accounts,
    categories,
    availableTags,
    tagSummary,

    // Loading states
    loading,
    tagSummaryLoading,
    saving,
    deleting,
    loadingItemsId,

    // UI state
    showForm,
    showScanner,
    showTagSummary,
    deleteId,
    editingTransaction,
    viewingItems,

    // Form / filter state
    formData,
    filters,
    filteredCategories,
    dateWarning,
    hasActiveFilters: activeFilters,

    // Pagination
    currentPage,
    paginationInfo,
    itemsPerPage: ITEMS_PER_PAGE,

    // Filter handlers
    setStartDate,
    setEndDate,
    toggleCategory,
    removeCategory,
    setAccountId,
    setMinAmount,
    setMaxAmount,
    setType,
    setGroupByCategory,
    setTag,
    clearFilters,

    // Pagination handlers
    nextPage,
    previousPage,

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
    setShowTagSummary,
    setEditingTransaction,
    setViewingItems,
    reloadTagSummary,
  };
}
