import React, { useEffect, useState } from 'react';
import { Card, CardContent, Box, Typography, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import api from '../../../../services/api';
import { useCommunity } from '../../../../contexts/CommunityContext';
import { AsaasAccountCard } from '../../../../components/AsaasAccount/AsaasAccountCard';

interface AsaasAccount {
  id: string;
  community_id: string;
  name: string;
  email: string;
  cpf_cnpj: string;
  company_type: string;
  phone: string;
  mobile_phone: string;
  address: string;
  address_number: string;
  complement: string;
  province: string;
  postal_code: string;
  birth_date: string;
  api_key: string;
  wallet_id: string;
  status: string;
  asaas_id: string;
  created_at: string;
  updated_at: string;
  bank: string;
  bank_agency: string;
  bank_account: string;
  bank_account_type: string;
  commercial_info: string;
  bank_account_info: string;
  documentation: string;
  general_status: string;
  onboarding_url?: string;
  person_type: string;
  webhooks: any;
}

const AsaasSettings: React.FC = () => {
  const [account, setAccount] = useState<AsaasAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const { activeCommunity } = useCommunity();

  const loadAccount = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/communities/${activeCommunity?.id}/donations/asaas/accounts`);
      console.log('Resposta da API:', response.data);
      
      if (response.data.accounts && response.data.accounts.length > 0) {
        const apiAccount = response.data.accounts[0];
        setAccount({
          ...apiAccount,
          community_id: activeCommunity?.id || '',
          cpf_cnpj: apiAccount.cpf_cnpj,
          company_type: apiAccount.company_type,
          phone: apiAccount.phone || '',
          mobile_phone: apiAccount.mobile_phone || '',
          address: apiAccount.address || '',
          address_number: apiAccount.address_number || '',
          complement: apiAccount.complement || '',
          province: apiAccount.province || '',
          postal_code: apiAccount.postal_code || '',
          birth_date: apiAccount.birth_date || '',
          api_key: apiAccount.api_key || '',
          wallet_id: apiAccount.wallet_id || '',
          asaas_id: apiAccount.asaas_id || '',
          created_at: apiAccount.created_at || '',
          updated_at: apiAccount.updated_at || '',
          bank: apiAccount.bank || '',
          bank_agency: apiAccount.bank_agency || '',
          bank_account: apiAccount.bank_account || '',
          bank_account_type: apiAccount.bank_account_type || '',
          commercial_info: apiAccount.commercial_info || '',
          bank_account_info: apiAccount.bank_account_info || '',
          documentation: apiAccount.documentation || '',
          general_status: apiAccount.general_status || '',
          onboarding_url: apiAccount.onboarding_url,
          person_type: apiAccount.person_type || '',
          webhooks: apiAccount.webhooks || []
        });
      } else {
        setAccount(null);
      }
    } catch (error) {
      console.error('Erro ao carregar conta:', error);
      enqueueSnackbar('Erro ao carregar dados da conta', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!account) return;
    
    try {
      await api.post(`/communities/${activeCommunity?.id}/donations/asaas/accounts/${account.id}/refresh`);
      enqueueSnackbar('Dados atualizados com sucesso', { variant: 'success' });
      loadAccount(); // Recarrega os dados
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      enqueueSnackbar('Erro ao atualizar dados da conta', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (activeCommunity?.id) {
      loadAccount();
    }
  }, [activeCommunity]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <div className="loading-spinner"></div>
      </Box>
    );
  }

  if (!account) {
    return (
      <Card sx={{ maxWidth: 600, margin: '0 auto', mt: 4 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            Nenhuma conta Comunidade+ encontrada
          </Typography>
          <Typography color="textSecondary" sx={{ mb: 3 }}>
            Configure uma nova conta para receber doações.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.href = '/donations/asaas/create'}
          >
            Criar Nova Conta
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <AsaasAccountCard account={account as AsaasAccount} onRefresh={handleRefresh} />;
};

export default AsaasSettings; 