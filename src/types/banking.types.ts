export interface TrueLayerAccount {
  truelayerAccountId: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
}

export interface BankConnection {
  id: string;
  userId: string;
  provider: string;
  truelayerAccountId: string;
  accountName: string;
  bankName: string;
  currency: string;
  lastSyncedAt: string | null;
  isActive: boolean;
  accountId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankingStatus {
  isConnected: boolean;
  connections: {
    bankName: string;
    accountName: string;
    lastSyncedAt: string | null;
  }[];
}

export interface ConfirmMappingsPayload {
  pendingAuthId: string;
  mappings: {
    truelayerAccountId: string;
    appAccountId: string;
  }[];
}
