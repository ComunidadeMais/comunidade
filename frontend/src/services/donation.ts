import api from './api';
import { Campaign, Donation, RecurringDonation, AsaasConfig } from '../types/donation';

export interface BankAccount {
  bank: string;
  bank_agency: string;
  bank_account: string;
  bank_account_type: string;
}

export interface WebhookConfig {
  name: string;
  url: string;
  email: string;
  send_type: string;
  interrupted: boolean;
  enabled: boolean;
  api_version: number;
  auth_token: string;
  events: string[];
}

export interface AsaasAccount {
  id: string;
  community_id: string;
  name: string;
  email: string;
  cpf_cnpj: string;
  birth_date?: string;
  company_type: string;
  phone: string;
  mobile_phone?: string;
  address: string;
  address_number: string;
  complement?: string;
  province: string;
  postal_code: string;
  api_key?: string;
  wallet_id?: string;
  status: string;
  asaas_id?: string;
  created_at: string;
  updated_at: string;
  webhooks: WebhookConfig[];
  responsible_name: string;
  responsible_cpf: string;
  responsible_birth_date: string;
  responsible_phone: string;
  responsible_email: string;
  bank_account: BankAccount;
}

export const donationService = {
  // Campanhas
  listCampaigns: (communityId: string) => 
    api.get<Campaign[]>(`/communities/${communityId}/campaigns`),
  
  getCampaign: (communityId: string, campaignId: string) =>
    api.get<Campaign>(`/communities/${communityId}/campaigns/${campaignId}`),
  
  createCampaign: (communityId: string, data: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Campaign>(`/communities/${communityId}/campaigns`, data),
  
  updateCampaign: (communityId: string, campaignId: string, data: Partial<Campaign>) =>
    api.put<Campaign>(`/communities/${communityId}/campaigns/${campaignId}`, data),
  
  deleteCampaign: (communityId: string, campaignId: string) =>
    api.delete(`/communities/${communityId}/campaigns/${campaignId}`),

  // Doações
  listDonations: (communityId: string) =>
    api.get<Donation[]>(`/communities/${communityId}/donations`),
  
  getDonation: (communityId: string, donationId: string) =>
    api.get<Donation>(`/communities/${communityId}/donations/${donationId}`),
  
  createDonation: (communityId: string, data: Omit<Donation, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Donation>(`/communities/${communityId}/donations`, data),
  
  updateDonation: (communityId: string, donationId: string, data: Partial<Donation>) =>
    api.put<Donation>(`/communities/${communityId}/donations/${donationId}`, data),
  
  deleteDonation: (communityId: string, donationId: string) =>
    api.delete(`/communities/${communityId}/donations/${donationId}`),

  // Doações Recorrentes
  listRecurringDonations: (communityId: string) =>
    api.get<RecurringDonation[]>(`/communities/${communityId}/recurring-donations`),
  
  getRecurringDonation: (communityId: string, recurringDonationId: string) =>
    api.get<RecurringDonation>(`/communities/${communityId}/recurring-donations/${recurringDonationId}`),
  
  createRecurringDonation: (communityId: string, data: Omit<RecurringDonation, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<RecurringDonation>(`/communities/${communityId}/recurring-donations`, data),
  
  updateRecurringDonation: (communityId: string, recurringDonationId: string, data: Partial<RecurringDonation>) =>
    api.put<RecurringDonation>(`/communities/${communityId}/recurring-donations/${recurringDonationId}`, data),
  
  deleteRecurringDonation: (communityId: string, recurringDonationId: string) =>
    api.delete(`/communities/${communityId}/recurring-donations/${recurringDonationId}`),

  // ASAAS Account
  createAsaasAccount: async (communityId: string, data: Partial<AsaasAccount>) => {
    const response = await api.post<AsaasAccount>(`/communities/${communityId}/donations/asaas/accounts`, data);
    return response.data;
  },

  getAsaasAccount: async (communityId: string) => {
    const response = await api.get<{ accounts: AsaasAccount[]; pagination: any }>(`/communities/${communityId}/donations/asaas/accounts`);
    return response.data;
  },

  updateAsaasAccount: async (communityId: string, accountId: string, data: Partial<AsaasAccount>) => {
    const response = await api.put<AsaasAccount>(`/communities/${communityId}/donations/asaas/accounts/${accountId}`, data);
    return response.data;
  },

  deleteAsaasAccount: async (communityId: string, accountId: string) => {
    await api.delete(`/communities/${communityId}/donations/asaas/accounts/${accountId}`);
  },

  listAsaasAccounts: async (communityId: string) => {
    const response = await api.get<{ accounts: AsaasAccount[]; pagination: any }>(`/communities/${communityId}/donations/asaas/accounts`);
    return response.data;
  },

  // Bank Accounts
  addBankAccount: async (communityId: string, data: BankAccount) => {
    const response = await api.post<BankAccount>(`/communities/${communityId}/donations/asaas/bank-accounts`, data);
    return response.data;
  },

  deleteBankAccount: async (communityId: string, accountId: string) => {
    await api.delete(`/communities/${communityId}/donations/asaas/bank-accounts/${accountId}`);
  },

  refreshAsaasAccount: async (communityId: string, accountId: string) => {
    const response = await api.post(`/communities/${communityId}/donations/asaas/accounts/${accountId}/refresh`);
    return response.data;
  }
}; 