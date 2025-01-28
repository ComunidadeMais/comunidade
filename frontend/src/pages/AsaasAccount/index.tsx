import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AsaasAccountCard } from '../../components/AsaasAccount/AsaasAccountCard';
import api from '../../services/api';

interface BankAccount {
  bank: string;
  bank_agency: string;
  bank_account: string;
  bank_account_type: string;
}

interface AsaasAccount {
  id: string;
  name: string;
  email: string;
  cpf_cnpj: string;
  company_type: string;
  status: string;
  bank_account: BankAccount;
}

export const AsaasAccountPage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const [account, setAccount] = useState<AsaasAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccount();
  }, [communityId]);

  const loadAccount = async () => {
    try {
      const response = await api.get(`/communities/${communityId}/donations/asaas/accounts`);
      setAccount(response.data);
    } catch (error) {
      toast.error('Erro ao carregar dados da conta Comunidade+');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBankAccount = async (bankAccount: BankAccount) => {
    try {
      await api.put(`/communities/${communityId}/donations/asaas/accounts/bank-account`, bankAccount);
      toast.success('Dados bancários atualizados com sucesso!');
      await loadAccount();
    } catch (error) {
      toast.error('Erro ao atualizar dados bancários');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg shadow-lg p-8">
        <svg 
          className="w-16 h-16 text-gray-400 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
          />
        </svg>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma conta Comunidade+ encontrada</h2>
        <p className="text-gray-500 text-center">Configure uma nova conta para começar a receber doações através do Comunidade+.</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          onClick={() => {/* Adicionar lógica para criar conta */}}
        >
          Configurar Nova Conta
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Configurações Comunidade+</h1>
        <p className="text-primary-100">Gerencie sua conta Comunidade+ e configurações de pagamento para receber doações.</p>
      </div>
      
      <AsaasAccountCard 
        account={account} 
        onUpdateBankAccount={handleUpdateBankAccount} 
      />
    </div>
  );
}; 