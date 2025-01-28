import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export interface AccountStatus {
  id: string;
  commercialInfo: 'REJECTED' | 'APPROVED' | 'AWAITING_APPROVAL' | 'PENDING';
  bankAccountInfo: 'REJECTED' | 'APPROVED' | 'PENDING';
  documentation: 'REJECTED' | 'APPROVED' | 'AWAITING_APPROVAL' | 'PENDING';
  general: 'REJECTED' | 'APPROVED' | 'AWAITING_APPROVAL' | 'PENDING';
}

export function useAsaasAccountStatus(communityId: string, accountId: string) {
  return useQuery<AccountStatus>({
    queryKey: ['asaas-account-status', communityId, accountId],
    queryFn: async () => {
      const { data } = await api.get(
        `/communities/${communityId}/donations/asaas/accounts/${accountId}/status`
      );
      return data;
    },
  });
} 