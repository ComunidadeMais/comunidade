export interface Campaign {
  id: string;
  name: string;
  description?: string;
  goal: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface BillingAddress {
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface Donation {
  id: string;
  campaign_id?: string;
  member_id?: string;
  amount: number;
  payment_method: string;
  status: string;
  due_date: string;
  description: string;
  customer_name: string;
  customer_cpf: string;
  customer_email: string;
  customer_phone: string;
  billing_address: BillingAddress;
  payment_date?: string;
  created_at: string;
  updated_at: string;
  payment_link?: string;
}

export interface RecurringDonation {
  id: string;
  member_id?: string;
  amount: number;
  payment_method: string;
  status: string;
  frequency: string;
  next_payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AsaasConfig {
  id: string;
  api_key: string;
  sandbox: boolean;
  webhook_token?: string;
  created_at: string;
  updated_at: string;
} 