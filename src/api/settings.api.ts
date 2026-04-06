import { api } from './client';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteAccountData {
  password: string;
  confirmation: 'DELETE';
}

export interface AccountStatistics {
  accounts: number;
  transactions: number;
  categories: number;
  fixedExpenses: number;
  debts: number;
  memberSince: string;
}

export const settingsApi = {
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await api.get('/settings/profile');
    return data;
  },

  updateProfile: async (profileData: UpdateProfileData): Promise<UserProfile> => {
    const { data } = await api.patch('/settings/profile', profileData);
    return data.profile;
  },

  changePassword: async (passwordData: ChangePasswordData): Promise<{ message: string }> => {
    const { data } = await api.post('/settings/change-password', passwordData);
    return data;
  },

  getStatistics: async (): Promise<AccountStatistics> => {
    const { data } = await api.get('/settings/statistics');
    return data;
  },

  deleteAccount: async (deleteData: DeleteAccountData): Promise<{ message: string }> => {
    const { data } = await api.delete('/settings/account', { data: deleteData });
    return data;
  },
};
