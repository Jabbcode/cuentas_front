import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '../api';
import { useAccounts } from './useAccounts';
import { groupAccountsByType, buildAccountPayload, calculateBalanceTotals } from '../utils';
import { logger } from '../../../lib/logger';
import type { Account, CreditCardStatement } from '../../../types';
import type {
  AccountFormData,
  ExpandedSections,
  UseAccountsPageReturn,
  UseAccountsPageOptions,
} from '../types';

const DEFAULT_FORM_DATA: AccountFormData = {
  name: '',
  type: 'bank',
  balance: '0',
  currency: 'EUR',
  color: '#3B82F6',
  creditLimit: '',
  cutoffDay: '',
  paymentDueDay: '',
  paymentAccountId: '',
};

const DEFAULT_EXPANDED_SECTIONS: ExpandedSections = {
  bank: true,
  credit_card: true,
  cash: true,
};

export function useAccountsPage({
  fetchSummary,
}: UseAccountsPageOptions = {}): UseAccountsPageReturn {
  const queryClient = useQueryClient();
  const { accounts, loading, reload, error: loadError } = useAccounts();

  const [statementsMap, setStatementsMap] = useState<Record<string, CreditCardStatement>>({});
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] =
    useState<ExpandedSections>(DEFAULT_EXPANDED_SECTIONS);
  const [formData, setFormData] = useState<AccountFormData>(DEFAULT_FORM_DATA);

  useEffect(() => {
    const hasCreditCards = accounts.some((a) => a.type === 'credit_card');
    if (!hasCreditCards || !fetchSummary) return;
    let cancelled = false;
    const load = async () => {
      try {
        const summary = await fetchSummary();
        if (!cancelled) {
          const map: Record<string, CreditCardStatement> = {};
          for (const card of summary.cards) {
            map[card.account.id] = card;
          }
          setStatementsMap(map);
        }
      } catch {
        // Silently fail — balance fallback uses account data directly
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [accounts, fetchSummary]);

  const { totalBalance, unpaidClosedTotal } = useMemo(
    () => calculateBalanceTotals(accounts, statementsMap),
    [accounts, statementsMap]
  );

  const groupedAccounts = useMemo(() => groupAccountsByType(accounts), [accounts]);

  const openForm = useCallback((account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toString(),
        currency: account.currency,
        color: account.color ?? '#3B82F6',
        creditLimit: account.creditLimit?.toString() ?? '',
        cutoffDay: account.cutoffDay?.toString() ?? '',
        paymentDueDay: account.paymentDueDay?.toString() ?? '',
        paymentAccountId: account.paymentAccountId ?? '',
      });
    } else {
      setEditingAccount(null);
      setFormData(DEFAULT_FORM_DATA);
    }
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingAccount(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
        const payload = buildAccountPayload(formData);
        if (editingAccount) {
          await accountsApi.update(editingAccount.id, payload);
          toast.success('Cuenta actualizada');
          logger.info('account', 'Account updated', { id: editingAccount.id, name: formData.name });
        } else {
          await accountsApi.create(payload);
          toast.success('Cuenta creada correctamente');
          logger.info('account', 'Account created', { name: formData.name });
        }
        setShowForm(false);
        await queryClient.invalidateQueries({ queryKey: ['accounts'] });
      } catch (err) {
        toast.error('No se pudo guardar la cuenta');
        logger.error('account', 'Failed to save account', err, { name: formData.name });
      } finally {
        setSaving(false);
      }
    },
    [formData, editingAccount, queryClient]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await accountsApi.delete(deleteId);
      toast.success('Cuenta eliminada');
      logger.info('account', 'Account deleted', { id: deleteId });
      setDeleteId(null);
      await queryClient.invalidateQueries({ queryKey: ['accounts'] });
    } catch (err) {
      toast.error('No se pudo eliminar la cuenta');
      logger.error('account', 'Failed to delete account', err, { id: deleteId });
    } finally {
      setDeleting(false);
    }
  }, [deleteId, queryClient]);

  const toggleSection = useCallback((type: Account['type']) => {
    setExpandedSections((prev) => ({ ...prev, [type]: !prev[type] }));
  }, []);

  return {
    accounts,
    statementsMap,
    groupedAccounts,
    totalBalance,
    unpaidClosedTotal,
    loading,
    saving,
    deleting,
    showForm,
    editingAccount,
    deleteId,
    showTransfer,
    expandedSections,
    formData,
    openForm,
    closeForm,
    setFormData,
    handleSubmit,
    handleDelete,
    setDeleteId,
    setShowTransfer,
    toggleSection,
    reload,
    loadError,
    selectedAccountId,
    setSelectedAccountId,
  };
}
