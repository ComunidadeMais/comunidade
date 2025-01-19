import api from './api';
import { Campaign, Donation, RecurringDonation, AsaasConfig } from '../types/donation';

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

  // Configurações Asaas
  getAsaasConfig: (communityId: string) =>
    api.get<AsaasConfig>(`/communities/${communityId}/asaas-config`),
  
  updateAsaasConfig: (communityId: string, data: Partial<AsaasConfig>) =>
    api.put<AsaasConfig>(`/communities/${communityId}/asaas-config`, data),
}; 