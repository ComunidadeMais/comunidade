export interface AsaasAccount {
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
  complement?: string;
  province: string;
  postal_code: string;
  birth_date: string;
  api_key?: string;
  wallet_id?: string;
  status: string;
  asaas_id?: string;
  
  // Dados bancários
  bank?: string;
  bank_agency?: string;
  bank_account?: string;
  bank_account_type?: string;
  
  // Status do onboarding
  commercial_info: string;
  bank_account_info: string;
  documentation: string;
  general_status: string;
  onboarding_url?: string;
  person_type: string;
  
  created_at: string;
  updated_at: string;
} 