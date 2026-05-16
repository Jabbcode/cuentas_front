import type { Account } from '../../types';
import type { BankConnection } from '../../types/banking.types';

export interface AccountFormData {
  name: string;
  type: 'cash' | 'bank' | 'credit_card';
  balance: string;
  currency: string;
  color: string;
  creditLimit: string;
  cutoffDay: string;
  paymentDueDay: string;
  paymentAccountId: string;
}

export interface AccountPayload {
  name: string;
  type: 'cash' | 'bank' | 'credit_card';
  balance: number;
  currency: string;
  color: string;
  creditLimit?: number;
  cutoffDay?: number;
  paymentDueDay?: number;
  paymentAccountId?: string;
}

export interface ExpandedSections {
  bank: boolean;
  credit_card: boolean;
  cash: boolean;
}

export interface UseAccountsPageReturn {
  accounts: Account[];
  statementsMap: Record<string, import('../../types').CreditCardStatement>;
  groupedAccounts: Record<Account['type'], Account[]>;
  totalBalance: number;
  unpaidClosedTotal: number;
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  showForm: boolean;
  editingAccount: Account | null;
  deleteId: string | null;
  showTransfer: boolean;
  expandedSections: ExpandedSections;
  formData: AccountFormData;
  openForm: (account?: Account) => void;
  closeForm: () => void;
  setFormData: React.Dispatch<React.SetStateAction<AccountFormData>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDelete: () => Promise<void>;
  setDeleteId: (id: string | null) => void;
  setShowTransfer: (show: boolean) => void;
  toggleSection: (type: Account['type']) => void;
  reload: () => void;
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
  getConnectionForAccount: (accountId: string) => BankConnection | undefined;
  handleDisconnect: (connectionId: string) => Promise<void>;
  handleSync: (connectionId: string) => Promise<void>;
}
